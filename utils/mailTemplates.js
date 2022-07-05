module.exports = {
  forgotPasswordHTML: (heading, code) => {
    return `
  <table
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    padding: 20px 60px;
    font-family: 'Open Sans', sans-serif;
    border-collapse: collapse;
    margin: 0 auto;
  "
>
  <tbody>
    <tr>
      <td>
        <img
          style="
            -ms-interpolation-mode: bicubic;
            outline: none;
            border-right-width: 0;
            border-bottom-width: 0;
            border-left-width: 0;
            text-decoration: none;
            border-top-width: 0;
            display: block;
            max-width: 100%;
            line-height: 100%;
            height: auto;
            width: 600px;
          "
          width="600"
          src="https://pages.parksystems.com/rs/988-FTP-549/images/FAMT2022_426x90.jpg"
        />
      </td>
    </tr>
    
    <tr>
      <td>
        <p style="text-align: center; font-weight: 700; font-size: 18px">
        ${heading}
        </p>
      </td>
    </tr>
    
    <tr
      class="box"
      style="
        font-family: 'Open Sans', sans-serif;
        width: 50%;
        border: 1px solid #f4f4f4;
        margin: 0 auto;
        font-size: 20px;
      "
    >
      <td>
        <p style="margin: 10px 20px">
          Verification code:
          <span
            class="code"
            style="
              font-style: italic;
              font-size: 22px;
              font-weight: 700;
              cursor: pointer;
            "
            >${code}</span
          >
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <p style="margin-top: 20px">
          Submit a verification code above to reset your password.
        </p>
      </td>
    </tr>

    <tr>
      <td>
        <hr
          style="margin: 20px 0; width: 100%; border-top: 1px solid #f4f4f4"
        />
      </td>
    </tr>
    <tr>
      <td>
        <p
          class="desc-wrap text-center"
          style="font-family: 'Open Sans', sans-serif; font-size: 12px"
        >
          <a
            href="https://famt.parksystems.com/"
            target="_blank"
            style="
              margin-top: 20px;
              font-size: 15px;
              color: black;
              font-weight: 700;
              text-decoration: none;
            "
            >FAMT 2022</a
          >
        </p>
      </td>
    </tr>
  </tbody>
</table>
`;
  },
};
