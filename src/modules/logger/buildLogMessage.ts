/**
 * Builds a placement string based on the input array of placement values.
 *
 * @param {string[]} placement - The array of placement values
 * @return {string} The constructed placement string
 */
export const buildPlacement = (placement: string[]): string => {
  switch (placement.length) {
    case 0: return '';
    case 1: return `{${placement[0]}}`;
    case 2: return `{${placement[0]}::${placement[1]}}`;
    default: {
      const [main, secondary, ...other] = placement;
      return `{${main}::${secondary} (${other.join(' ')})}`;
    }
  }
};

/**
 * Concatenates the prefix, current timestamp, placement array, message, and postfix into a log message.
 *
 * @param {string} prefix - The prefix of the log message.
 * @param {string[]} placement - The array indicating the placement of the log message.
 * @param {string} message - The main message content.
 * @param {string} postfix - The postfix of the log message.
 * @return {string} The formatted log message.
 */
export const buildLogMessage = (
  prefix: string,
  placement: string[],
  message: string,
  postfix: string,
) => `${prefix}\t[${new Date().toISOString()}]\t${buildPlacement(placement)}\t${message}\t${postfix}`;
