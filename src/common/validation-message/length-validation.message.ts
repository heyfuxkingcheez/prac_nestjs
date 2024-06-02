import { ValidationArguments } from "class-validator";

export const lengthValidationMessage = (args: ValidationArguments) => {
  // value -> 입력된 값
  // constraints -> 파라미터에 입력된 제한 사항들
  // targerName -> 검증하고 있는 클래스 이름
  // object -> 검증하고 있는 객체
  // property -> 검증 되고 있는 객체의 프로퍼티 이름
  if (args.constraints.length === 2) {
    return `${args.property}은 ${args.constraints[0]}~${args.constraints[1]}글자를 입력 해주세요.`;
  } else {
    return `${args.property}는 최소 ${args.constraints[0]}글자를 입력 해주세요.`;
  }
};
