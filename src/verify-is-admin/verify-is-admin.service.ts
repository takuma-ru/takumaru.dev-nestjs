import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { IdTokenDto } from './IdToken.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class VerifyIsAdminService {
  /**
   * 引数のトークンを検証後 uid を取得し、その uid がアドミンかどうかを検証する
   * @param body トークン
   * @returns アドミンかどうかのフラグ
   */
  async VerifyIsAdmin(body: IdTokenDto, res: Response) {
    /**
     * リクエストBodyのトークンを
     * @param idToken リクエストBodyのidToken
     * @returns idTokenuid
     */
    const VerifyIdToken = async (idToken: string) => {
      let returnValue: string = null;
      await admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          returnValue = decodedToken.uid;
        })
        .catch((error) => {
          console.log(error);
          return res.status(HttpStatus.FORBIDDEN).send({
            isAdmin: false,
            message: error,
          });
        });

      return returnValue;
    };

    // リクエストbody に idToken がなかった場合はアドミンではないとして処理終了
    if (!body.idToken) {
      return res.status(HttpStatus.NOT_ACCEPTABLE).send({
        isAdmin: false,
        message:
          'The requested value is not an allowed value (null) and processing cannot continue',
      });
    }

    let requestedUid: string;

    // 引数のトークンを検証し、uidを返す
    await VerifyIdToken(body.idToken).then((uid) => {
      requestedUid = uid;
    });

    if (!requestedUid) {
      return res.status(HttpStatus.FORBIDDEN).send({
        isAdmin: false,
        message:
          'Firebase ID token has invalid signature. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.',
      });
    }

    const db = admin.firestore();
    // Firestore に保存されているアドミンのuid配列を取得する
    let approvedUidList: Array<string>;
    await db
      .collection('adminUserData')
      .doc('approvedUid')
      .get()
      .then((doc) => {
        if (doc.exists) {
          approvedUidList = doc.data().uids as Array<string>;
        } else {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
            isAdmin: false,
            message: `Error getting document: Could not retrieve administrator list information`,
          });
        }
      })
      .catch((error) => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          isAdmin: false,
          message: `Error getting document: ${error}`,
        });
      });

    /**
     * アドミンかどうかのフラグ
     *
     * リクエストトークン内のuidがFirestoreに保存されているアドミン配列に存在したら true(アドミン), 出なければ false(アドミンではない)
     */
    const isAdmin = approvedUidList.includes(requestedUid) ? true : false;

    if (!isAdmin) {
      return res.status(HttpStatus.FORBIDDEN).send({
        isAdmin: false,
        message: 'You are not registered as an administrator',
      });
    } else {
      return res.status(HttpStatus.OK).send({ isAdmin: isAdmin });
    }
  }
}
