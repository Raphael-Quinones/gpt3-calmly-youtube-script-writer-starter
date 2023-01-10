chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'inject') {
        const {content} = request;

        console.log(content);

        sendResponse({ status: 'success' });
    }
})

const insert = (content) => {
    //get div with classname droid which includes p tag for writing
    const elements = document.getElementsByClassName('droid');

    if(elements.length === 0) {
        return;
    }

    //get topmost div with name droid
    const element = elements[0]
    console.log(element)

    //get first p tag to replace it in the top most part of the area
    const pToRemove = element.childNodes[0]
    pToRemove.remove();

    //split for every newline to replace it with br later
    const splitContent = content.split('\n')

    splitContent.forEach((content) => {
        const p = document.createElement('p')

        //newlines are ''
        if (content === ''){
            const br = document.createElement('br')
            p.appendChild = br
        } else {
            p.textContent = content
        }

        element.appendChild(p)
    })



    return true
}

chrome.runtime.onMessage.addListener(
    //Listens to message
    (request, sender, sendResponse) => {
        if (request.message === 'inject') {
            const { content } = request

            const result = insert(content);

            if (!result) {
                sendResponse({ status: 'failed'});
            }

            sendResponse({status: 'success'})
        }
    }
)