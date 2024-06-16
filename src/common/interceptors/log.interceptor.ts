import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, map, tap } from "rxjs";

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    /**
     * 요청이 들어올 때 req 요청이 들어온 타임스탬프를 찍는다.
     * [req] {요청 path} {요청 시간}
     *
     * 요청이 끝날 때 (응답이 나갈 때) 다시 타임스탬프를 찍는다.
     * [res] {요청 path} {응답 시간} {얼마나 걸렸는데 ms}
     */

    const req = context.switchToHttp().getRequest();

    // /posts
    // /common/image
    const path = req.originalUrl;

    const now = new Date();

    // [req] {요청 path} {요청 시간}
    console.log(
      `[req] ${path} ${now.toLocaleString("kr")}`,
    );

    // 라우트의 로직이 모두 실행되고 응답이 반환된다.
    // observable로
    return next.handle().pipe(
      // 출력 해주는 함수
      tap(
        // [res] {요청 path} {응답 시간} {얼마나 걸렸는데 ms}
        observable =>
          console.log(
            `[res] ${path} ${new Date().toLocaleString("kr")} ${new Date().getMilliseconds() - now.getMilliseconds()}ms`,
          ),
      ),
    );
  }
}
