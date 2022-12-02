import tracer from 'dd-trace';

import { httpTracingConfig, inferResourceName, request } from './httpTracing';

describe('inferResourceName', () => {
  const METHOD = 'GET';
  const PROTOCOL = 'https:';
  const HOST = 'example.com';

  it('handles direct URL variants', () => {
    const paths = [
      '/accounts/1?include=rules',
      '/brands/default?id=12345&type=seekId',
      '/path/to/resource',
      '/product-sets?advertiserId=67890',
      '/product-sets/fbfb9754-63e6-494E-9473-EF46CA51FF47?advertiserId=0',
      '/product-sets/FBFB975463E6494E9473EF46CA51FF47',
      '/v2/resource',
      '/v10/resource',
    ];

    const results = paths.map((path) => {
      const url = `${PROTOCOL}//${HOST}${path}`;

      return [`${METHOD} ${url}`, inferResourceName({ method: METHOD, url })];
    });

    expect(results).toMatchInlineSnapshot(`
      [
        [
          "GET https://example.com/accounts/1?include=rules",
          "GET https://example.com/accounts/number?include=rules",
        ],
        [
          "GET https://example.com/brands/default?id=12345&type=seekId",
          "GET https://example.com/brands/default?id=number&type=seekId",
        ],
        [
          "GET https://example.com/path/to/resource",
          "GET https://example.com/path/to/resource",
        ],
        [
          "GET https://example.com/product-sets?advertiserId=67890",
          "GET https://example.com/product-sets?advertiserId=number",
        ],
        [
          "GET https://example.com/product-sets/fbfb9754-63e6-494E-9473-EF46CA51FF47?advertiserId=0",
          "GET https://example.com/product-sets/uuid?advertiserId=number",
        ],
        [
          "GET https://example.com/product-sets/FBFB975463E6494E9473EF46CA51FF47",
          "GET https://example.com/product-sets/uuid",
        ],
        [
          "GET https://example.com/v2/resource",
          "GET https://example.com/v2/resource",
        ],
        [
          "GET https://example.com/v10/resource",
          "GET https://example.com/v10/resource",
        ],
      ]
    `);
  });

  it('handles http.ClientRequest variants', () => {
    const paths = [
      '/accounts/1?include=rules',
      '/brands/default?id=12345&type=seekId',
      '/path/to/resource',
      '/product-sets?advertiserId=67890',
      '/product-sets/fbfb9754-63e6-494E-9473-EF46CA51FF47?advertiserId=0',
    ];

    const results = paths.map((path) => [
      `${METHOD} ${PROTOCOL}//${HOST}${path}`,
      inferResourceName({
        host: HOST,
        method: METHOD,
        path,
        protocol: PROTOCOL,
      }),
    ]);

    expect(results).toMatchInlineSnapshot(`
      [
        [
          "GET https://example.com/accounts/1?include=rules",
          "GET https://example.com/accounts/number?include=rules",
        ],
        [
          "GET https://example.com/brands/default?id=12345&type=seekId",
          "GET https://example.com/brands/default?id=number&type=seekId",
        ],
        [
          "GET https://example.com/path/to/resource",
          "GET https://example.com/path/to/resource",
        ],
        [
          "GET https://example.com/product-sets?advertiserId=67890",
          "GET https://example.com/product-sets?advertiserId=number",
        ],
        [
          "GET https://example.com/product-sets/fbfb9754-63e6-494E-9473-EF46CA51FF47?advertiserId=0",
          "GET https://example.com/product-sets/uuid?advertiserId=number",
        ],
      ]
    `);
  });

  it('preserves IP hosts', () => {
    const hosts = [
      '127.0.0.1',
      '::1',
      '0000:0000:0000:0000:0000:0000:0000:0000',
    ];

    const results = hosts.map((host) => {
      const url = `${PROTOCOL}//${host}`;

      return [`${METHOD} ${url}`, inferResourceName({ method: METHOD, url })];
    });

    expect(results).toMatchInlineSnapshot(`
      [
        [
          "GET https://127.0.0.1",
          "GET https://127.0.0.1",
        ],
        [
          "GET https://::1",
          "GET https://::1",
        ],
        [
          "GET https://0000:0000:0000:0000:0000:0000:0000:0000",
          "GET https://0000:0000:0000:0000:0000:0000:0000:0000",
        ],
      ]
    `);
  });

  it.each(['DELETE', 'GET', 'HEAD', 'POST', 'PUT'])(
    'handles method %p',
    (method) =>
      expect(inferResourceName({ method, url: '/path/to/resource' })).toBe(
        `${method} /path/to/resource`,
      ),
  );

  it.each`
    description                                | method       | protocol     | host                 | path         | url
    ${'method only'}                           | ${'GET'}     | ${undefined} | ${undefined}         | ${undefined} | ${undefined}
    ${'URL without a method'}                  | ${undefined} | ${undefined} | ${undefined}         | ${undefined} | ${'/abc'}
    ${'http.ClientRequest without a method'}   | ${undefined} | ${'http:'}   | ${'example.com'}     | ${'/abc'}    | ${undefined}
    ${'http.ClientRequest without a protocol'} | ${'POST'}    | ${undefined} | ${'test.invalid'}    | ${'/abc'}    | ${undefined}
    ${'http.ClientRequest without a host'}     | ${'PUT'}     | ${'https:'}  | ${undefined}         | ${'/abc'}    | ${undefined}
    ${'http.ClientRequest without a path'}     | ${'HEAD'}    | ${'https:'}  | ${'www.example.com'} | ${undefined} | ${undefined}
  `('bails on $description', ({ description, ...req }) =>
    expect(inferResourceName(req)).toBeUndefined(),
  );
});

describe('request', () => {
  it('is compatible with dd-trace', () => {
    tracer.use('http', {
      hooks: {
        request,
      },
    });

    expect.assertions(0);
  });

  it('infers a resource name tag from a simple URL', () => {
    const span = {
      setTag: jest.fn(),
    };

    expect(() =>
      request(span, {
        method: 'PUT',
        url: 'https://www.example.com/path/to/123?idempotencyKey=c1083fb6-519c-42bf-8619-08dfd6229954',
      }),
    ).not.toThrow();

    expect(span.setTag).toHaveBeenCalledTimes(1);
    expect(span.setTag).toHaveBeenNthCalledWith(
      1,
      'resource.name',
      'PUT https://www.example.com/path/to/number?idempotencyKey=uuid',
    );
  });

  it('gracefully continues on missing parameters', () => {
    const span = {
      setTag: jest.fn(),
    };

    expect(() => request()).not.toThrow();

    expect(span.setTag).not.toHaveBeenCalled();
  });

  it('gracefully continues on inference failure', () => {
    const span = {
      setTag: jest.fn(),
    };

    expect(() => request(span, undefined)).not.toThrow();

    expect(span.setTag).not.toHaveBeenCalled();
  });
});

describe('httpTracingConfig', () => {
  it('is compatible with dd-trace', () => {
    tracer.use('http', httpTracingConfig);

    expect.assertions(0);
  });
});
