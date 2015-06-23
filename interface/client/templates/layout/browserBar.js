/**
Template Controllers

@module Templates
*/

/**
The browserBar template

@class [template] layout_browserBar
@constructor
*/


Template['layout_browserBar'].helpers({
    /**
    Break the URL in protocol, domain and folders

    @method (breadcrumb)
    */
    'breadcrumb': function(){
        if(!this || !this.url)
            return;

        var pattern  = /([^\:]*)\:\/\/([^\/]*)\/([^\?\.]*)/
        var search = this.url.match(pattern);

        if(!search)
            return;

        var urlObject = {
            url: search[0],
            protocol: search[1],
            domain: search[2].split("."),
            folders: search[3].split("/"),
        }

        var breadcrumb = "<span>" + urlObject.domain.reverse().join(" » ") + " </span> » " + urlObject.folders.join(" » ");

        return new Spacebars.SafeString(breadcrumb);
    },
    /**
    Returns the current dapp

    @method (dapp)
    */
    'dapp': function(){
        return Tabs.findOne(LocalStore.get('selectedTab'));
    },
    /**
    Show the add button, when on a dapp and in doogle

    @method (isBrowser)
    */
    'isBrowser': function(){
        return (LocalStore.get('selectedTab') === 'browser');
    },
    /**
    Current selected view

    @method (currentWebView)
    */
    'currentWebView': function(){
        return '.tab-view webview[data-id="'+ LocalStore.get('selectedTab') +'"]';
    }
});

Template['layout_browserBar'].events({
    /*
    Go back in the dapps browser history

    @event click button.back
    */
    'click button.back': function(){
        var webview = Helpers.getWebview(LocalStore.get('selectedTab'));

        if(webview && webview.canGoBack())
            webview.goBack();
    },
    /*
    Reload the current webview

    @event click button.reload
    */
    'click button.reload': function(){
        var webview = Helpers.getWebview(LocalStore.get('selectedTab'));
        
        if(webview)
            webview.reload();
    },
    /*
    Add the current selected URL as tab

    @event click button.add-tab
    */
    'click button.add-tab': function(){
        var webview = $('webview[data-id="browser"]')[0];

        if(webview) {
            var id = Tabs.insert({
                url: webview.getUrl(),
                name: webview.getTitle(),
                menu: {},
                menuVisible: false,
                position: Tabs.find().count() + 1
            });

            LocalStore.set('selectedTab', id);
        }
    },
    /*
    Remove the current selected tab

    // TODO show popup before to confirm

    @event click button.remove-tab
    */
    'click button.remove-tab': function(){
        var tabId = LocalStore.get('selectedTab');
        
        Tabs.remove(tabId);
        LocalStore.set('selectedTab', 'browser');
    },
    /*
    Send the domain

    @event submit
    */
    'submit': function(e, template){     
        var tabs = Tabs.find().fetch(),
            url = Helpers.formatUrl(template.find('input').value);


        // look in tabs
        var foundTab = _.find(tabs, function(tab){
                var tabOrigin = new URL(tab.url).origin;
                return (url.indexOf(tabOrigin) !== -1);
            });

        // switch tab to browser
        if(foundTab)
            foundTab = foundTab._id;
        else
            foundTab = 'browser';


        // update current tab url
        Tabs.update(foundTab, {$set: {
            url: url,
            redirect: url
        }});
        LocalStore.set('selectedTab', foundTab);
    }
});
