import { HttpStatusCode } from 'axios';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 200, // maximum number of requests allowed in the windowMs
  handler: (req, res) => {
    console.error('ERROR : rateLimiter Middleware');

    return res.status(HttpStatusCode.TooManyRequests).send({
      success: false,
      statusCode: HttpStatusCode.TooManyRequests,
      message:
        'Você excedeu o número máximo de requisições. Tente novamente mais tarde. Se você continuar tendo problemas, por favor, contate nosso time.',
    });
  },
});

export default limiter;