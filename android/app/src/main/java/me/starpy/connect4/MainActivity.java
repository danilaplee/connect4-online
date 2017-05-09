package me.starpy.connect4;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Message;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
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
    public String  appUrl   = "https://starpy.me/connect4";
    public int mainLayout;
    public WebView webView;
    public WebView callView;
    public FrameLayout webFrame;
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

        Intent intent = getIntent();
        String action = intent.getAction();
        Uri data = intent.getData();
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        requestPermissionScheme(Manifest.permission.INTERNET, MY_PERMISSIONS_REQUEST_INTERNET);
        requestPermissionScheme(Manifest.permission.WAKE_LOCK, MY_PERMISSIONS_REQUEST_WAKE);
        mainLayout = R.layout.activity_main;
        setContentView(mainLayout);
        mainView = (LinearLayout) findViewById(R.id.mainView);
        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
        webFrame = new FrameLayout(mContext);
        webFrame.setLayoutParams(params);
        mainView.addView(webFrame);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED, WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED);
        if(data != null) {
            loadChromeApp(data.toString());
        }
        else {
            loadChromeApp(appUrl);
        }
    }

    /////////////////////////////////////////
    ////////// RECOGNIZE HTTP INTENT ////////
    ////////////////////////////////////////

    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        String action = intent.getAction();
        Uri data = intent.getData();
        if(data != null) {
            if(callView != null) callView.destroy();
            if(webView != null) webView.destroy();
            hasLoadedWebview = 0;
            loadChromeApp(data.toString());
        }
    }

    ////////////////////////////////////////
    /// LOAD HTML5 GAME APP INTO WEBVIEW ///
    ////////////////////////////////////////

    private void loadChromeApp(String url){
        webView = new WebView(mContext);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setRenderPriority(WebSettings.RenderPriority.HIGH);
        webView.getSettings().setPluginState(WebSettings.PluginState.ON);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        webView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.getSettings().setSupportMultipleWindows(true);
        webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
        webView.setWebContentsDebuggingEnabled(true);
        webView.getSettings().setDatabaseEnabled(true);
        if (Build.VERSION.SDK_INT >= 11){
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        }
        else {
            webView.getSettings().setDatabasePath("/data/data/" + webView.getContext().getPackageName() + "/databases/");
        }
        webView.setInitialScale(185);

        webView.setWebViewClient(new WebViewClient()
        {
            @Override
            public void onPageFinished(final WebView view, String url) {
                if(hasLoadedWebview == 1) return;
                hasLoadedWebview = 1;
                webFrame.addView(webView);
                FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
                webView.setLayoutParams(params);
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
                if(url.contains("app://")) {
                    final String in_app_url = url.replace("app://", "");
                    if (url.contains("#call")) {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                createCallWindow(in_app_url);
                            }
                        });
                    }
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
                if(uri.toString().contains("app://")) {
                    final String in_app_url = uri.toString().replace("app://", "");
                    if (in_app_url.contains("#call")) {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                createCallWindow(in_app_url);
                            }
                        });
                    }
                    return true;
                }
                view.loadUrl(uri.toString());
                return true;
            }
        });
        webView.loadUrl(url);
    }

    ////////////////////////////////////////
    /// CREATE WEBRTC ENABLED CALL WINDOW //
    ////////////////////////////////////////

    private void createCallWindow(String url) {
        print("creating_call_window");
        print(url);
        callView = new WebView(mContext);
        callView.getSettings().setJavaScriptEnabled(true);
        callView.getSettings().setDomStorageEnabled(true);
        callView.getSettings().setPluginState(WebSettings.PluginState.ON);
        callView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        callView.getSettings().setRenderPriority(WebSettings.RenderPriority.HIGH);
        callView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        callView.getSettings().setSupportMultipleWindows(true);
        callView.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
        callView.getSettings().setDatabaseEnabled(true);
        if (Build.VERSION.SDK_INT >= 11){
            callView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        }
        else {
            callView.getSettings().setDatabasePath("/data/data/" + webView.getContext().getPackageName() + "/databases/");
        }
        callView.setWebContentsDebuggingEnabled(true);

        callView.setInitialScale(100);
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
                print("call_view_finished_loading");
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        webFrame.addView(callView);
                        webFrame.bringChildToFront(callView);
                    }
                });
            }
        });
        callView.setLayoutParams(new FrameLayout.LayoutParams(512, 384));
        callView.setY(mainView.getHeight()-384);
        callView.setX(mainView.getWidth()-512);
        callView.loadUrl(url);
    }

    //////////////////////////////////////
    ////// CREATE REACT NATIVE VIEW //////
    //////////////////////////////////////

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

    /////////////////////////////////////////
    /////////// REQUEST PERMISSIONS /////////
    ////////////////////////////////////////


    private void requestPermissions(){
        requestPermissionScheme(Manifest.permission.CAMERA, MY_PERMISSIONS_REQUEST_CAMERA);
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

