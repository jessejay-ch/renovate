import { logger } from '../../../test/util';
import type { Logger } from '../../logger/types';
import * as memCache from '../../util/cache/memory';
import { printRequestStats } from './stats';

const log = logger.logger as jest.Mocked<Logger>;

describe('workers/repository/stats', () => {
  beforeEach(() => {
    memCache.init();
  });

  describe('printRequestStats()', () => {
    it('runs', () => {
      memCache.set('package-cache-gets', [30, 100, 10, 20]);
      memCache.set('package-cache-sets', [110, 80, 20]);
      memCache.set('http-requests', [
        {
          method: 'get',
          url: 'https://api.github.com/api/v3/user',
          duration: 100,
          queueDuration: 0,
          statusCode: 200,
        },
        {
          method: 'post',
          url: 'https://api.github.com/graphql',
          duration: 130,
          queueDuration: 0,
          statusCode: 401,
        },
        {
          method: 'post',
          url: 'https://api.github.com/graphql',
          duration: 150,
          queueDuration: 0,
          statusCode: 200,
        },
        {
          method: 'post',
          url: 'https://api.github.com/graphql',
          duration: 20,
          queueDuration: 10,
          statusCode: 200,
        },
        {
          method: 'get',
          url: 'https://api.github.com/api/v3/repositories',
          duration: 500,
          queueDuration: 0,
          statusCode: 500,
        },
        {
          method: 'get',
          url: 'https://auth.docker.io',
          duration: 200,
          queueDuration: 0,
          statusCode: 401,
        },
      ]);
      expect(printRequestStats()).toBeUndefined();
      expect(log.trace).toHaveBeenCalledOnce();
      expect(log.debug).toHaveBeenCalledTimes(2);
      expect(log.trace.mock.calls[0][0]).toMatchInlineSnapshot(`
        {
          "allRequests": [
            "GET https://api.github.com/api/v3/repositories 500 500 0",
            "GET https://api.github.com/api/v3/user 200 100 0",
            "POST https://api.github.com/graphql 401 130 0",
            "POST https://api.github.com/graphql 200 150 0",
            "POST https://api.github.com/graphql 200 20 10",
            "GET https://auth.docker.io 401 200 0",
          ],
          "requestHosts": {
            "api.github.com": [
              {
                "duration": 500,
                "method": "get",
                "queueDuration": 0,
                "statusCode": 500,
                "url": "https://api.github.com/api/v3/repositories",
              },
              {
                "duration": 100,
                "method": "get",
                "queueDuration": 0,
                "statusCode": 200,
                "url": "https://api.github.com/api/v3/user",
              },
              {
                "duration": 130,
                "method": "post",
                "queueDuration": 0,
                "statusCode": 401,
                "url": "https://api.github.com/graphql",
              },
              {
                "duration": 150,
                "method": "post",
                "queueDuration": 0,
                "statusCode": 200,
                "url": "https://api.github.com/graphql",
              },
              {
                "duration": 20,
                "method": "post",
                "queueDuration": 10,
                "statusCode": 200,
                "url": "https://api.github.com/graphql",
              },
            ],
            "auth.docker.io": [
              {
                "duration": 200,
                "method": "get",
                "queueDuration": 0,
                "statusCode": 401,
                "url": "https://auth.docker.io",
              },
            ],
          },
        }
      `);
      expect(log.debug.mock.calls[0][0]).toMatchInlineSnapshot(`
        {
          "get": {
            "avgMs": 40,
            "count": 4,
            "maxMs": 100,
            "medianMs": 20,
            "totalMs": 160,
          },
          "set": {
            "avgMs": 70,
            "count": 3,
            "maxMs": 110,
            "medianMs": 80,
            "totalMs": 210,
          },
        }
      `);
      expect(log.debug.mock.calls[1][0]).toMatchInlineSnapshot(`
        {
          "hostStats": {
            "api.github.com": {
              "queueAvgMs": 2,
              "requestAvgMs": 180,
              "requestCount": 5,
            },
            "auth.docker.io": {
              "queueAvgMs": 0,
              "requestAvgMs": 200,
              "requestCount": 1,
            },
          },
          "totalRequests": 6,
          "urls": {
            "https://api.github.com/api/v3/repositories (GET,500)": 1,
            "https://api.github.com/api/v3/user (GET,200)": 1,
            "https://api.github.com/graphql (POST,200)": 2,
            "https://api.github.com/graphql (POST,401)": 1,
            "https://auth.docker.io (GET,401)": 1,
          },
        }
      `);
    });
  });
});
