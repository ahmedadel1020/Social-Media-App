import bcrypt from "bcrypt";
export const hash = async (
  plaintext: string,
  rounds: number = 12,
  minor: "a" | "b" = "b",
): Promise<string> => {
  const salt = (await bcrypt.genSalt(rounds, minor)).toString();
  console.log(plaintext, salt);
  return await bcrypt.hash(plaintext, salt);
};

export const compare = async (
  plaintext: string,
  ciphertext: string,
): Promise<boolean> => {
  return bcrypt.compare(plaintext, ciphertext);
};
