import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleOAuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = environment.apiUrl;
  private readonly clientId = environment.googleClientId;
  
  private googleInitialized = false;

  /**
   * Initialize Google Identity Services
   */
  async initializeGoogle(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('Google OAuth can only be initialized in the browser');
    }

    if (this.googleInitialized) {
      return Promise.resolve();
    }

    // Load Google Identity Services script
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (typeof google !== 'undefined' && google.accounts) {
        this.googleInitialized = true;
        resolve();
        return;
      }

      // Load the script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Google Identity Services script loaded');
        this.googleInitialized = true;
        resolve();
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Google Identity Services script:', error);
        reject(new Error('Failed to load Google Identity Services'));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Render Google Sign-In button in specified container
   */
  renderGoogleButton(container: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.googleInitialized || typeof google === 'undefined') {
      console.error('Google Identity Services not initialized');
      return;
    }

    try {
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response: any) => this.handleCredentialResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render the button
      google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        width: container.offsetWidth || 300,
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });

      console.log('Google button rendered successfully');
    } catch (error) {
      console.error('Error rendering Google button:', error);
    }
  }

  /**
   * Trigger Google login programmatically (popup)
   */
  async loginWithGoogle(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('Google login can only be triggered in the browser');
      return;
    }

    if (!this.googleInitialized || typeof google === 'undefined') {
      throw new Error('Google Identity Services not initialized');
    }

    // Dispatch event to notify listeners that login has started
    window.dispatchEvent(new CustomEvent('google-login-started'));

    try {
      // Initialize Google Identity Services with callback
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response: any) => this.handleCredentialResponse(response),
        auto_select: false,
        itp_support: false  // Disable ITP support to avoid FedCM issues
      });

      // Skip One Tap and directly use OAuth flow
      // This avoids CORS and FedCM issues
      this.triggerGoogleSignIn();
    } catch (error) {
      console.error('Google login error:', error);
      window.dispatchEvent(new CustomEvent('google-login-error'));
      throw error;
    }
  }

  /**
   * Trigger Google Sign-In using OAuth 2.0 implicit flow
   */
  private triggerGoogleSignIn(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      // Use the OAuth 2.0 endpoint directly
      const client = google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: 'openid email profile',
        callback: async (tokenResponse: any) => {
          // Get user info using the access token
          try {
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                'Authorization': `Bearer ${tokenResponse.access_token}`
              }
            });
            
            const userInfo = await userInfoResponse.json();
            
            // Create a credential-like object for compatibility
            const credentialResponse = {
              credential: tokenResponse.access_token,
              clientId: this.clientId,
              select_by: 'btn',
              userInfo: userInfo
            };
            
            this.handleOAuthResponse(credentialResponse);
          } catch (error) {
            console.error('Error fetching user info:', error);
            window.dispatchEvent(new CustomEvent('google-login-error'));
          }
        },
        error_callback: (error: any) => {
          console.error('Google OAuth error:', error);
          window.dispatchEvent(new CustomEvent('google-login-error'));
        }
      });
      
      // Request the access token
      client.requestAccessToken();
    } catch (error) {
      console.error('Error triggering Google sign-in:', error);
      // Fallback to popup method
      this.showGooglePopup();
    }
  }

  /**
   * Show Google sign-in popup as fallback
   */
  private showGooglePopup(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const popup = window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: this.clientId,
        redirect_uri: `${environment.frontendUrl}/auth/google/callback`,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'select_account',
      })}`,
      'googleSignIn',
      'width=500,height=600,left=100,top=100'
    );

    if (!popup) {
      console.error('Popup blocked by browser');
      window.dispatchEvent(new CustomEvent('google-login-error'));
      return;
    }
  }

  /**
   * Handle OAuth response with access token
   */
  private async handleOAuthResponse(response: any): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const userInfo = response?.userInfo;
    
    if (!userInfo) {
      console.error('No user info received from Google');
      window.dispatchEvent(new CustomEvent('google-login-error'));
      return;
    }

    console.log('Google OAuth user info received, sending to backend...');

    try {
      // Send user info to backend for authentication
      const result: any = await this.http.post(`${this.baseUrl}/auth/google/oauth`, {
        email: userInfo.email,
        name: userInfo.name,
        googleId: userInfo.sub,
        picture: userInfo.picture,
        email_verified: userInfo.email_verified
      }).toPromise();

      if (result?.success && result?.data) {
        const { token, user } = result.data;
        
        // Complete login using AuthService
        this.authService.completeExternalLogin(token, user);
        
        // Dispatch success event
        window.dispatchEvent(new CustomEvent('google-login-success'));
        
        console.log('Google login successful');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error authenticating with backend:', error);
      
      // Dispatch error event
      window.dispatchEvent(new CustomEvent('google-login-error'));
      
      throw error;
    }
  }

  /**
   * Handle credential response from Google (for ID token flow)
   */
  private async handleCredentialResponse(response: any): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const credential = response?.credential;
    
    if (!credential) {
      console.error('No credential received from Google');
      window.dispatchEvent(new CustomEvent('google-login-error'));
      return;
    }

    console.log('Google credential received, sending to backend...');

    try {
      // Send the credential (JWT ID token) to your backend
      const result: any = await this.http.post(`${this.baseUrl}/auth/google/token`, {
        credential: credential
      }).toPromise();

      if (result?.success && result?.data) {
        const { token, user } = result.data;
        
        // Complete login using AuthService
        this.authService.completeExternalLogin(token, user);
        
        // Dispatch success event
        window.dispatchEvent(new CustomEvent('google-login-success'));
        
        console.log('Google login successful');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error authenticating with backend:', error);
      
      // Dispatch error event
      window.dispatchEvent(new CustomEvent('google-login-error'));
      
      throw error;
    }
  }
}
