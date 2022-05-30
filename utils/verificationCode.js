module.exports = {
  // 난수 인증번호 생성
  create: () => {
    let result = Math.floor(Math.random() * 1000000);
    return result < 100000 ? "0" + result : "" + result;
  },
};


