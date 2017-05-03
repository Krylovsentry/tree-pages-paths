(function () {
    let currentRootUrl,
        currentUrlAsArray,
        urlsObject,
        urlsArray;

    //
    // chrome.storage.sync.clear();
    chrome.storage.sync.get("urls", function (urls) {
        urlsObject = urls;
    });

    window.onload = function () {
        let saveButton = document.getElementById('save-button');
        let treeBlock = document.getElementById('tree');

        let root = createRootDiv(treeBlock);

        if (urlsObject.urls) {
            urlsArray = urlsObject.urls;
        } else {
            urlsArray = [];
        }
        prepareTree(root);
        saveButton.onclick = function () {
            parseUrl(root);
        };

        //query for getting url of current active tab
        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
            currentUrlAsArray = tabs[0].url.split('/');
            currentRootUrl = currentUrlAsArray.slice(0, 3).join('/');
            currentUrlAsArray = currentUrlAsArray.slice(3, currentUrlAsArray.length + 1);
        });
    };


    function prepareTree(root) {
        if (urlsArray) {
            urlsArray.forEach(function (url) {
                let last,
                    fullUrl;
                url.split('/').forEach(function (urlPart, i) {
                    fullUrl = fullUrl ? fullUrl + '/' + urlPart : urlPart;
                    let nodeElement = createNode().init().setURLValue(fullUrl, urlPart);
                    if (!last) {
                        root.addChild(nodeElement);
                    } else {
                        last.addChild(nodeElement);
                    }
                    last = nodeElement;
                });
            });
        }
    }


    function parseUrl(root) {
        let last,
            fullUrl;
        currentUrlAsArray.forEach(function (urlPart, i) {
            fullUrl = fullUrl ? fullUrl + '/' + urlPart : urlPart;
            let nodeElement = createNode().init().setURLValue(fullUrl, urlPart);
            if (!last) {
                root.addChild(nodeElement);
            } else {
                last.addChild(nodeElement);
            }
            last = nodeElement;
        });
        urlsArray.push(fullUrl);
        //maybe move to unload
        chrome.storage.sync.set({"urls": urlsArray});
        //
    }


//Node for tree
    function createNode() {

        let containerElement,
            nodeElement,
            expandElement,
            contentElement,
            url,
            children;

        function node() {
        }

        node.init = function () {
            containerElement = document.createElement('ul');
            containerElement.className = 'container-element';
            nodeElement = document.createElement('li');
            nodeElement.className = 'node-element';
            expandElement = document.createElement('div');
            expandElement.className = 'expand-element';
            contentElement = document.createElement('div');
            contentElement.className = 'content-element';

            children = [];

            //register on click for content element
            contentElement.onclick = function () {
                chrome.tabs.create({url: currentRootUrl + '/' + url});
            };

            containerElement.appendChild(nodeElement);
            nodeElement.appendChild(expandElement);
            nodeElement.appendChild(contentElement);
            return this;
        };

        node.getElement = function () {
            return containerElement;
        };

        node.open = function () {

        };

        node.close = function () {

        };

        node.addChild = function (child) {
            containerElement.appendChild(child.getElement());
            children.push(child);
        };

        node.getURL = function () {
            return url;
        };

        node.setURLValue = function (fullUrl, urlValue) {
            url = fullUrl;
            contentElement.innerHTML = urlValue;
            return this;
        };

        return node;
    }





    function createRootDiv(baseElement) {
        let rootElement,
            children;

        rootElement = baseElement;
        children = [];

        return {
            rootElement: rootElement,
            getChildren: children,
            addChild: function (child) {
                rootElement.appendChild(child.getElement());
                children.push(child);
            }
        }
    }


}());

