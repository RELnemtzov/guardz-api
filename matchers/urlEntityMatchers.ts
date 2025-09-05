import { UrlEntity } from '../../src/entities/url.entity';

expect.extend({
  toMatchUrlsIgnoringOrder(received: UrlEntity[], expectedUrls: string[]) {
    // Extract URLs from entities; make a copy and sort both
    const receivedUrls = received.map((e) => e.url).sort();
    const sortedExpected = [...expectedUrls].sort();

    // Compare URLs (ignoring order)
    const urlsMatch =
      JSON.stringify(receivedUrls) === JSON.stringify(sortedExpected);

    // Check timestamps are numbers
    const timestampsValid = received.every((e) => !isNaN(e.timestamp));

    const pass = urlsMatch && timestampsValid;

    return {
      pass,
      message: () =>
        pass
          ? `Expected UrlEntity[] not to match urls ${JSON.stringify(expectedUrls)}`
          : `Urls or timestamps did not match.\nReceived: ${JSON.stringify(receivedUrls)}\nExpected: ${JSON.stringify(sortedExpected)}\nTimestamps valid: ${timestampsValid}`,
    };
  },
});

declare global {
  // Add typing for the matcher
  namespace jest {
    interface Matchers<R> {
      toMatchUrlsIgnoringOrder(expectedUrls: string[]): R;
    }
  }
}
