import { Router } from 'express';
import { check } from 'express-validator';

import * as usersController from '../controllers/usersController';
import fileUpload from '../middleware/fileUpload';

const router = Router();

router.get('/', usersController.getAllUsers);
router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  usersController.signup
);
router.post(
  '/login',
  [
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  usersController.login
);

export default router;
