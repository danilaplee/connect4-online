package me.starpy.connect4;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Bundle;
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
    public Context mContext = this;
    public String  appUrl   = "https://danilaplee.github.io/connect4-online/bin";
    public int mainLayout;
    public WebView webView;
    public LinearLayout mainView;
    private int hasLoadedWebview = 0;
    private ReactRootView mReactRootView;
    private ReactInstanceManager mReactInstanceManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mainLayout = R.layout.activity_main;
        setContentView(mainLayout);
        mainView = (LinearLayout) findViewById(R.id.mainView);
        loadChromeApp(appUrl);
    }

    private void addJavascriptInterfaces() {

    }

    private void loadChromeApp(String url){
        webView = new WebView(mContext);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setPluginState(WebSettings.PluginState.ON);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        webView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.getSettings().setSupportMultipleWindows(true);
        webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);

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

            }
            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("mailto:")) {
                    //Handle mail Urls
                    startActivity(new Intent(Intent.ACTION_SENDTO, Uri.parse(url)));
                    return true;
                }
                view.loadUrl(url);
                return true;
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                final Uri uri = request.getUrl();
                Log.e("overriding load", uri.toString());
                if (uri.toString().startsWith("mailto:")) {
                    //Handle mail Urls
                    startActivity(new Intent(Intent.ACTION_SENDTO, uri));
                    return true;
                }
                //Handle Web Urls
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

}

