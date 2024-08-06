export const postMessage = async (
  type: string,
  data: any,
) => {
  window.ReactNativeWebView?.postMessage(JSON.stringify({ type, data }));
  const result = await handlePostMessageResult(type);
	return result;  
};

const handlePostMessageResult = async (type) => {
  const wrappedPromise = getWrappedPromiseObj(type);

  const result = await wrappedPromise.promise;
  return result;
};

export const getWrappedPromiseObj = (type) => {
  let resolvePromise;
  let rejectPromise;

  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  const wrappedPromise = {
    promise,
    type,
    resolve: resolvePromise,
    reject: rejectPromise,
  };

  return wrappedPromise;
};

window.addEventListener('message', (event) => {
  const { type, data } = JSON.parse(event.data);

  const handler = receiveWebviewMessageMap.get(type);
  handler?.(data);
});
