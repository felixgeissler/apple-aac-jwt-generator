import * as jwt from "npm:jsonwebtoken";
import * as chalk from "jsr:@nothing628/chalk";

export async function generateJwtForAAC({
  kid,
  privateKeyPath,
}: {
  kid: string;
  privateKeyPath: string;
}): Promise<string> {
  const header = {
    alg: "ES256",
    kid,
    typ: "JWT",
  };

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 1200;
  const payload = {
    sub: "user",
    iat,
    exp,
    aud: "appstoreconnect-v1",
  };

  const privateKey = await Deno.readFile(privateKeyPath);
  const token = jwt.sign(payload, privateKey, {
    algorithm: "ES256",
    header,
    allowInvalidAsymmetricKeyTypes: true,
  });

  return token;
}

if (import.meta.main) {
  const [kid, privateKeyPath] = Deno.args;
  if (!kid || !privateKeyPath) {
    console.error("Usage: <kid> <privateKeyPath>");
    Deno.exit(1);
  }

  try {
    await Deno.stat(privateKeyPath);
  } catch (e: unknown) {
    if (e instanceof Deno.errors.NotFound) {
      console.error(
        chalk.default.red(`Error: Private key not found at ${privateKeyPath}`),
      );
      Deno.exit(1);
    }
    throw e;
  }

  const jwt = await generateJwtForAAC({ kid, privateKeyPath });

  console.log("Generated JWT:");
  console.log(chalk.default.green(jwt));
}
