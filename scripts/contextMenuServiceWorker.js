const getKey = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openai-key'], (result) => {
      if (result['openai-key']) {
        const decodedKey = atob(result['openai-key']);
        resolve(decodedKey);
      }
    });
  });
};

const sendMessage = (content) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0].id;

    chrome.tabs.sendMessage(
      activeTab,
      { message: 'inject', content },
      (response) => {
        if (response.status === 'failed') {
          console.log('injection failed.');
        }
      }
    );
  });
};

const generate = async (prompt) => {
  console.log("before key")
  const key = await getKey();
  console.log("after key")
  const url = 'https://api.openai.com/v1/completions';

	
  const completionResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 1250,
      temperature: 0.7,
    }),
  });

  console.log(completionResponse)
	
  const completion = await completionResponse.json();
  return completion.choices.pop();
}

const generateCompletionAction = async (info) => {
	try {
		// Send mesage with generating text (this will be like a loading indicator)
		sendMessage('generating...');
    console.log("after generate")
	
    const { selectionText } = info;
    const basePromptPrefix =
		`
		Write me a detailed table of contents for a youtube script with the title below.

		Title:
		`;

    console.log("before baseCompletion")
    const baseCompletion = await generate(`${basePromptPrefix}${selectionText}`);
 
	const secondPrompt = 
	  `
	  Take the table of contents and title of the youtube video script below and generate a youtube script in the style of Mr Beast. Make it feel like a story. Don't just list the points. Go deep into each one. Explain why. Add in some call to actions whenever needed

	  Title: ${selectionText}

	  Table of Contents: ${baseCompletion.text}

	  Blog Post:
	  `;
		
    const secondPromptCompletion = await generate(secondPrompt);
		
	// Send the output when we're all done
	sendMessage(secondPromptCompletion.text);
  } catch (error) {
    console.log(error);

		// Add this here as well to see if we run into any errors!
		sendMessage(error.toString());
  }
};

chrome.contextMenus.create({
  id: 'context-run',
  title: 'Generate Youtube Script',
  contexts: ['selection'],
});

chrome.contextMenus.onClicked.addListener(generateCompletionAction);