() => {
  return new Promise((resolve) => {
    const api = window.myAppNameBrowser;

    for (const key in api) {
      console.log(key);
    }

    resolve();
  });
};
