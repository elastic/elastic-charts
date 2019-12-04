import { ElasticsearchRowResponse } from '../types/Types';

interface XhrConfig {
  url: string;
  user: string;
  password: string;
}

export const xhrConfig: XhrConfig = {
  url: 'http://127.0.0.1:9200/_sql?format=json',
  user: 'elastic',
  password: 'changeme',
};

const nullResponse: ElasticsearchRowResponse = { columns: [], rows: [] };

export const withXhr = ({ url, user, password }: XhrConfig, query: string) =>
  new Promise<ElasticsearchRowResponse>((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.onerror = () => {
      // console.error(`Couldn't reach the Elasticsearch server`);
      resolve(nullResponse);
    };
    xhr.onload = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (200 <= xhr.status && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          // console.error(`Error: HTTP code ${xhr.status}, statusText: ${xhr.statusText}`);
          resolve(nullResponse);
        }
      }
    };
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(`${user}:${password}`));
    xhr.send(JSON.stringify({ query, columnar: false }));
  });
