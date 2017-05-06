package me.starpy.connect4;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Bundle;
import android.os.Message;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;

import com.facebook.react.LifecycleState;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactRootView;
import com.facebook.react.shell.MainReactPackage;

/**
 * Created by danilapuzikov on 29/04/2017.
 */
public class MainActivity extends Activity {
    private static final int MY_PERMISSIONS_REQUEST_CAMERA = 1;
    private static final int MY_PERMISSIONS_REQUEST_VIDEO = 2;
    private static final int MY_PERMISSIONS_REQUEST_AUDIO = 3;
    private static final int MY_PERMISSIONS_REQUEST_INTERNET = 4;
    private static final int MY_PERMISSIONS_REQUEST_WAKE = 5;
    public Context mContext = this;
    public String  appUrl   = "https://danilaplee.github.io/connect4-online/bin";
    public int mainLayout;
    public WebView webView;
    public WebView callView;
    public LinearLayout mainView;
    private int hasLoadedWebview = 0;
    private ReactRootView mReactRootView;
    private ReactInstanceManager mReactInstanceManager;

    public void print(String string) {
        Log.e("me.starpy.connect4", string);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestPermissionScheme(Manifest.permission.INTERNET, MY_PERMISSIONS_REQUEST_INTERNET);
        requestPermissionScheme(Manifest.permission.WAKE_LOCK, MY_PERMISSIONS_REQUEST_WAKE);
        mainLayout = R.layout.activity_main;
        setContentView(mainLayout);
        mainView = (LinearLayout) findViewById(R.id.mainView);
        loadChromeApp(appUrl);
    }

    private void addJavascriptInterfaces() {

    }

    private void requestPermissions(){
        requestPermissionScheme(Manifest.permission.CAMERA, MY_PERMISSIONS_REQUEST_CAMERA);
        requestPermissionScheme(Manifest.permission.CAPTURE_VIDEO_OUTPUT, MY_PERMISSIONS_REQUEST_VIDEO);
        requestPermissionScheme(Manifest.permission.RECORD_AUDIO, MY_PERMISSIONS_REQUEST_AUDIO);
    }

    private void requestPermissionScheme(String permission, int key){
        if (ContextCompat.checkSelfPermission((Activity) mContext,
                permission)
                != PackageManager.PERMISSION_GRANTED) {

            // Should we show an explanation?
            if (ActivityCompat.shouldShowRequestPermissionRationale((Activity) mContext,
                    permission)) {

            } else {
                ActivityCompat.requestPermissions((Activity) mContext,
                        new String[]{permission},
                        key);
            }
        }
    }

    private void createCallWindow(String url) {
        callView = new WebView(mContext);
        callView.getSettings().setJavaScriptEnabled(true);
        callView.getSettings().setDomStorageEnabled(true);
        callView.getSettings().setPluginState(WebSettings.PluginState.ON);
        callView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        callView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        callView.getSettings().setSupportMultipleWindows(true);
        callView.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
        callView.setWebContentsDebuggingEnabled(true);
        callView.setInitialScale(185);
        callView.setWebChromeClient(new WebChromeClient(){
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                MainActivity.this.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        request.grant(request.getResources());
                    }
                });
            }
        });
        callView.setWebViewClient(new WebViewClient()
        {
            @Override
            public void onPageFinished(final WebView view, String url) {
                if(hasLoadedWebview == 1) return;
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
                hasLoadedWebview = 1;
                mainView.addView(callView);
                addJavascriptInterfaces();
                requestPermissions();
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.contains("#call")) {
                    view.loadUrl(url);
                    return true;
                }
                return true;
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                final Uri uri = request.getUrl();
                if (uri.toString().contains("#call")) {
                    view.loadUrl(uri.toString());
                    return true;
                }
                return true;
            }
        });
        webView.loadUrl(url);

    }

    private void loadChromeApp(String url){
        webView = new WebView(mContext);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setPluginState(WebSettings.PluginState.ON);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        webView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.getSettings().setSupportMultipleWindows(true);
        webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
        webView.setWebContentsDebuggingEnabled(true);
        webView.setInitialScale(185);
        webView.setWebChromeClient(new WebChromeClient(){
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                MainActivity.this.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        request.grant(request.getResources());
                    }
                });
            }
            @Override
            public boolean onCreateWindow(WebView view, boolean dialog, boolean userGesture, Message resultMsg)
            {
                print("overriding window create");
                print(resultMsg.toString());
                return false;
            }
        });
        webView.setWebViewClient(new WebViewClient()
        {
            @Override
            public void onPageFinished(final WebView view, String url) {
                if(hasLoadedWebview == 1) return;
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
                hasLoadedWebview = 1;
                mainView.addView(webView);
                addJavascriptInterfaces();
                requestPermissions();

            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Log.e("connect4","overriding load: "+url);
                if (url.startsWith("mailto:")) {
                    startActivity(new Intent(Intent.ACTION_SENDTO, Uri.parse(url)));
                    return true;
                }
                if (url.contains("#call")) {
                    createCallWindow(url);
                    return true;
                }
                view.loadUrl(url);
                return true;
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                final Uri uri = request.getUrl();
                Log.e("connect4","overriding load: "+uri.toString());
                if (uri.toString().startsWith("mailto:")) {
                    startActivity(new Intent(Intent.ACTION_SENDTO, uri));
                    return true;
                }
                if (uri.toString().contains("#call")) {
                    createCallWindow(uri.toString());
                    return true;
                }
                view.loadUrl(uri.toString());
                return true;
            }
        });
        webView.loadUrl(url);
    }

    private void startReactNativeApp(String appName)
    {
        mReactRootView = new ReactRootView(this);
        mReactInstanceManager = ReactInstanceManager.builder()
                .setApplication(getApplication())
                .setBundleAssetName("index.android.bundle")
                .setJSMainModuleName("index.android")
                .addPackage(new MainReactPackage())
                .setUseDeveloperSupport(BuildConfig.DEBUG)
                .setInitialLifecycleState(LifecycleState.RESUMED)
                .build();
        mReactRootView.startReactApplication(mReactInstanceManager, appName, null);
    }
    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           String permissions[], int[] grantResults) {
        switch (requestCode) {
            case MY_PERMISSIONS_REQUEST_CAMERA: {
                // If request is cancelled, the result arrays are empty.
                if (grantResults.length > 0
                        && grantResults[0] == PackageManager.PERMISSION_GRANTED) {

                    // permission was granted, yay! Do the
                    // contacts-related task you need to do.

                } else {

                    // permission denied, boo! Disable the
                    // functionality that depends on this permission.
                }
                return;
            }

            // other 'case' lines to check for other
            // permissions this app might request
        }
    }

}

