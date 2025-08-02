// import { IUserAttrs } from '../models/User';

// declare global {
//   namespace Express {
//     // Extend the Request interface to include user property
//     interface Request {
//       user?: IUserAttrs;
//     }
//   }
// }


import { IUserDoc, IUserAttrs } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDoc;
      
    }
    interface User extends IUserAttrs {
      _id: string;
    }
  }
}
