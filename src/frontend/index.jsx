import React, { useEffect, useState } from 'react';
import ForgeReconciler, {Text, Button, useProductContext} from '@forge/react';
import { invoke } from '@forge/bridge';
const App = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
  }, []);

  const context = useProductContext();
  const handleMerge = () => {
    invoke('mergePullRequest', {context: context})
      .then((respData) => console.log(respData))
  }
  return (
    <>
      <Text>{data ? data : 'Loading...'}</Text>
      <Button appearance="primary"
        onClick={handleMerge}
      >Merge pull request</Button>
    </>
  );
};
ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
