(function () {
    let currentRootUrl,
        currentUrlAsArray,
        urlsObject,
        urlsArray,
        root,
        addingPoint;

    //On load logic for popup
    window.onload = function () {
        // chrome.storage.sync.clear();
        chrome.storage.sync.get("urls", function (urls) {
            urlsObject = urls;
            let saveButton = document.getElementById('save-button');
            let treeBlock = document.getElementById('tree');

            root = createRootDiv(treeBlock);
            addingPoint = root;

            if (urlsObject.urls) {
                urlsArray = urlsObject.urls;
            } else {
                urlsArray = [];
            }

            //prepare tree with previously saved urls
            prepareTree();

            //register on click for save button
            saveButton.onclick = function () {
                parseUrl();
            };

            //query for getting url of current active tab
            chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
                currentUrlAsArray = tabs[0].url.split('/');
                currentRootUrl = currentUrlAsArray.slice(0, 3).join('/');
                currentUrlAsArray = currentUrlAsArray.slice(3, currentUrlAsArray.length + 1);
            });
        });
    };

    let throughUrl = function (urlPart, i, arr) {
        let fullUrl = arr.slice(0, i + 1).reduce(function (prev, curr, i) {
            return prev + '/' + curr;
        });
        let nodeElement = createNode();
        nodeElement.setURLValue(fullUrl, urlPart);
        let isAdded = false;

        if (addingPoint.getChildren.length) {
            addingPoint.getChildren.forEach(function (child, j, childArray) {
                if (!isAdded) {
                    if (child.getUrl() === urlPart) {
                        addingPoint = child;
                    } else if (j + 1 == childArray.length) {
                        addingPoint.addChild(nodeElement);
                        addingPoint = nodeElement;
                        isAdded = true;
                    }
                }
            });
        } else {
            addingPoint.addChild(nodeElement);
            addingPoint = nodeElement;
        }

        if (i + 1 == arr.length) {
            addingPoint = root;
        }
    };

    function prepareTree() {
        if (urlsArray) {
            urlsArray.forEach(function (url) {
                url.split('/').forEach(throughUrl);
            });
        }
    }

    function parseUrl() {
        currentUrlAsArray.forEach(throughUrl);
        //maybe move to unload
        urlsArray.push(currentUrlAsArray.join('/'));
        chrome.storage.sync.set({"urls": urlsArray});
        //
    }

    function createNode() {
        let containerElement,
            nodeElement,
            nodeElementsBlock,
            expandElement,
            contentElement,
            removeElement,
            url,
            fullOwnUrl,
            children;

        containerElement = document.createElement('ul');
        containerElement.className = 'container';
        nodeElement = document.createElement('li');
        nodeElement.className = 'node';
        nodeElementsBlock = document.createElement('div');
        nodeElementsBlock.className = 'node node-elements';
        expandElement = document.createElement('div');
        expandElement.className = 'expand';
        contentElement = document.createElement('div');
        contentElement.className = 'content';
        removeElement = document.createElement('button');
        removeElement.className = 'remove';

        children = [];

        //register on click for content element
        contentElement.onclick = function () {
            chrome.tabs.create({url: currentRootUrl + '/' + fullOwnUrl});
        };

        removeElement.onclick = function () {
        };

        nodeElementsBlock.appendChild(expandElement);
        nodeElementsBlock.appendChild(contentElement);
        nodeElementsBlock.appendChild(removeElement);
        nodeElement.appendChild(nodeElementsBlock);
        containerElement.appendChild(nodeElement);

        return {
            getElement: containerElement,
            addChild: function (child) {
                containerElement.appendChild(child.getElement);
                children.push(child);
            },
            getUrl: function () {
                return url;
            },
            getChildren: children,
            setURLValue: function (fullUrl, urlValue) {
                url = urlValue;
                fullOwnUrl = fullUrl;
                contentElement.innerHTML = urlValue;
            }
        }

    }


    //Can be rewrite with proto inheritance
    function createRootDiv(baseElement) {
        let rootElement,
            children;

        rootElement = baseElement;
        children = [];

        return {
            getElement: rootElement,
            getChildren: children,
            addChild: function (child) {
                rootElement.appendChild(child.getElement);
                children.push(child);
            }
        }
    }


}());

