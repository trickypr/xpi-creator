// Whilst I really want to use the TypeScript support, but without messing with
// the TypeScript compiler, I'm going to use the TypeScript compiler's

/**
 * Provides a function used to validate manifest file for an extension. The
 * primary function that should be used is {@link validator.validate}
 */
export namespace validator {
  /**
   * Provides a human readable string to describe where the error is located
   */
  export const errors: Record<string, number>
  /**
   * Maps an error number to a human readable string
   */
  export const errorCodes: Record<number, string>
  /**
   * Maps the error to a human readable description
   */
  export const errorMessages: Record<number, string>

  /**
   * Parses a manifest file and returns a list of errors.
   * @param {string} input An input manifest file
   * @returns {number[]} A list of errors
   */
  export function validate(input: string): number[]
}
