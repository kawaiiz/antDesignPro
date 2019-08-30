import { Request, Response } from 'express';

export default {
  'POST  /api/resetPassword': (_: Request, res: Response) => {
    res.send({ status: 'ok', currentAuthority: 'user' });
  },
};
