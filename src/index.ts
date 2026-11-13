import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import dotenv from 'dotenv';
import { FssaApplicationSchema } from './schemas/fssaApplication.schema.js';
import { processFssaSubmission } from './services/fssaPipeline.service.js';

dotenv.config();

const fastify = Fastify({ logger: true });

fastify.get('/health', async () => {
  return { status: 'healthy', service: 'fssa-auto-apply', timestamp: new Date().toISOString() };
});

fastify.post('/v1/fssa/apply', async (request: FastifyRequest, reply: FastifyReply) => {
  const validation = FssaApplicationSchema.safeParse(request.body);

  if (!validation.success) {
    return reply.code(400).send({
      status: 'error',
      message: 'Invalid FSSA application payload format',
      details: validation.error.format(),
    });
  }

  const result = await processFssaSubmission(validation.data);

  if (!result.success) {
    return reply.code(500).send({
      status: 'error',
      message: 'Failed to process FSSA application through pipeline',
      error: result.error,
    });
  }

  return reply.code(201).send({
    status: 'success',
    message: 'FSSA assistance application successfully structured and routed',
    applicationId: result.applicationId,
    pipelineStatus: result.status,
  });
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 8084;
    const host = process.env.HOST || '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`[BEAST 3.0] fssa-auto-apply microservice active on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
