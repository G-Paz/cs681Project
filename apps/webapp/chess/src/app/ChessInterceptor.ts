import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class ChessInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // const userToken = 'secure-user-token';
    const modifiedReq = req.clone({
      headers: req.headers.set('X-Frame-Options', 'DENY')
                          .set('X-Content-Type-Options', 'nosniff')
                          .set('Content-Security-Policy', "default-src 'self' 'unsafe-inline'; img-src https://* 'self' data:;")
                          .set('Access-Control-Allow-Origin', '*')
                          .set('content-type','application/json')
                          .set('accept','application/json')
                          .delete('X-Powered-By'),
      responseType: "json"
    });
    console.log("params:" + req.body)
    return next.handle(modifiedReq);
  }
}