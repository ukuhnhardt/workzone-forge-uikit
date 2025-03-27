import Resolver from '@forge/resolver';
import api, { route, fetch as forgeFetch } from '@forge/api';

const resolver = new Resolver();

resolver.define("mergePullRequest", async (req) => {
  console.log("mergePullRequest context", req.context);
  const { workspaceId, extension } = req.context;
  const { pullRequest, repository } = extension
  console.log("url", `/2.0/repositories/${workspaceId}/${repository.uuid}/pullrequests/${pullRequest.id}/merge`);

  const getPullRequest = await api.asApp().requestBitbucket(
    route`/2.0/repositories/${workspaceId}/${repository.uuid}/pullrequests/${pullRequest.id}`)
  const prData = await getPullRequest.json();
  console.log("getPullRequest:asApp response data", getPullRequest.status, getPullRequest.statusText);

  let upw = btoa(`${process.env["USERN"]}:${process.env["PASSW"]}`);
  console.log("upw", upw, `${process.env["USERN"]}:${process.env["PASSW"]}`);

  console.log("get PR:basicAuth trying forge-fetch basic auth");
  let response = await forgeFetch(`https://api.bitbucket.org/2.0/repositories/${workspaceId}/${repository.uuid}/pullrequests/${pullRequest.id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${upw}`,
    },
    redirect: 'follow'
  })
  let data = await response.json();
  let status = response.status;
  console.log("get pullrequest:forge-fetch:basicauth resp data", status, response.statusText);


  response = await api.asApp().requestBitbucket(
    route`/2.0/repositories/${workspaceId}/${repository.uuid}/pullrequests/${pullRequest.id}/merge`, {
    method: 'POST',
    body: `{"type" : ""}`,
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Basic ${upw}`
    }
  })
  data = await response.json();
  status = response.status;
  console.log("mergePullRequest:asApp response data", status, response.statusText, JSON.stringify(data, null, 2));
  if (status < 400) {
    return JSON.stringify({
      status: status,
      statusText: response.statusText,
      data: data
    }, null, 2
    );
  } else {
    console.log("mergePullRequest:basicAuth trying forge-fetch basic auth");
    response = await forgeFetch(`https://api.bitbucket.org/2.0/repositories/${workspaceId}/${repository.uuid}/pullrequests/${pullRequest.id}/merge`, {
      method: 'POST',
      body: `{"type" : ""}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${upw}`,
      },
      redirect: 'follow'
    })
    let data = await response.json();
    let status = response.status;
    console.log("mergePullRequest:basicauth forge-fetch basic auth resp data", status, response.statusText, JSON.stringify(data, null, 2));
    if (status < 400) {
      return JSON.stringify({
        status: status,
        statusText: response.statusText,
        data: data
      }, null, 2
      );
    } else {
      // ONLY .ASUSER() works, if the user that pushed the button has branch permissions.
      /*         let response = await api.asUser().requestBitbucket(
                route`/2.0/repositories/${workspaceId}/${repository.uuid}/pullrequests/${pullRequest.id}/merge`, {
                  method: 'POST',
                  body: `{"type" : ""}`,
                  headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Basic ${upw}`
                  }
                })
              let data = await response.json();
              let status = response.status;
              console.log("mergePullRequest:asUser response data", status, response.statusText, data);
              return JSON.stringify({
                  status: status,
                  statusText: response.statusText,
                  data: data
                }, null, 2
              );
       */
      return JSON.stringify({
        status: 500,
        statusText: "could not complete request"
      })
    }
  }
}
)

export const handler = resolver.getDefinitions();

resolver.define('getText', (req) => {
  console.log("getText", req.context);
  return 'Hello, Workzone!';
});

