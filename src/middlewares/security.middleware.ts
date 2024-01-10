import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";

// This list is used to allow public access to some routes
const PUBLIC_PATH = ["/", "/health"];

// export default anonymous function
export default (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) => {
  if (PUBLIC_PATH.includes(request.url)) {
    done();
    return;
  }
  // Check if the header contains bearer token
  if (
    request.headers.authorization != undefined &&
    request.headers.authorization.includes("Bearer")
  ) {
    const token = request.headers.authorization.split(" ")[1];

    // Check if the token is the same as the security keys from .env
    const securityKeys = JSON.parse(process.env.SECURITY_KEYS || "[]");
    const securityKeyObject = securityKeys.find(
      (o: { id: string; key: string }) => o.key === token
    );

    if (token != securityKeyObject!.key) {
      reply.code(401).send({
        status: 401,
        message: "Unauthorized",
      });
      return;
    }
  } else {
    reply.code(401).send({
      status: 401,
      message: "Unauthorized",
    });
    return;
  }

  done();
};
