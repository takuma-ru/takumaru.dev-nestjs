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
  async VerifyIsAdmin(body: IdTokenDto, res: Response): Promise<boolean> {
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
          res.status(HttpStatus.UNAUTHORIZED).send(error);
          return null;
        });

      return returnValue;
    };

    if (!body.idToken) {
      res
        .status(HttpStatus.NOT_ACCEPTABLE)
        .send(
          'The requested value is not an allowed value (null) and processing cannot continue',
        );
      return false;
    }

    // 引数のトークンを検証し、uidを返す
    const requestedUid = await VerifyIdToken(body.idToken).then((uid) => {
      return uid;
    });

    // requestedUid が null (= 検証に失敗)した場合は、アドミンではないとして処理を終了
    if (!requestedUid) {
      return false;
    }

    const db = admin.firestore();
    // Firestore に保存されているアドミンのuid配列を取得する
    const approvedUidList: Array<string> | null = await db
      .collection('adminUserData')
      .doc('approvedUid')
      .get()
      .then((doc) => {
        if (doc.exists) {
          return doc.data().uids;
        } else {
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send('You are not registered as an administrator');
          return;
        }
      })
      .catch((error) => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send(`Error getting document: ${error}`);
        return;
      });

    // uid配列が取得できなかった場合は、アドミンではないとして処理を終了
    if (!approvedUidList) {
      return false;
    }

    /**
     * アドミンかどうかのフラグ
     *
     * リクエストトークン内のuidがFirestoreに保存されているアドミン配列に存在したら true(アドミン), 出なければ false(アドミンではない)
     */
    const isAdmin = approvedUidList.includes(requestedUid) ? true : false;

    return isAdmin;
  }
}
