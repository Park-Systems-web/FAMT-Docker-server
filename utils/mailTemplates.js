module.exports = {
  forgotPasswordHTML: (heading, code, desc) => {
    return `<body class="text-center">
    <div style="padding: 20px 60px;font-family: &quot;Open Sans&quot;, sans-serif;">
      <h3>${heading}</h3>
      <div class="box" style="font-family: &quot;Open Sans&quot;, sans-serif;width: 50%;border: 1px solid #f4f4f4;margin: 0 auto;padding: 10px 20px;font-size: 20px;">
        <span>Verification code: <span class="code" style="font-style: italic;font-size: 22px;font-weight: 700;cursor: pointer;">${code}</span></span>
      </div>
      <div style="margin-top: 20px">
      Submit a verification code above to reset your password.
      </div>
      <hr style="margin: 20px 0;width: 100%;border-top: 1px solid #f4f4f4;">
      <div class="comming-title" style="font-family: &quot;Open Sans&quot;, sans-serif;font-size: 20px;color: #16aee5;font-weight: 700;">
        <span style="color: #003e7f">Nano<span><span style="color: #16aee5">Scientific</span> 2022
      </span></span></div>
  
      <div class="desc-wrap text-center" style="font-family: &quot;Open Sans&quot;, sans-serif;font-size: 12px;">
        <span class="desc desc-1">
          NanoScientific plans are underway to continue the excitement that comes
          from scientific innovation and discovery with a new line up for 2022!
        </span>
        <span class="desc desc-2">
          Stay tuned for the 2022 NanoScientific Event Calendar for your chance to
          network with leading experts who are pioneering the evolution of
          scientific discovery at NanoScientific Conferences Worldwide.
        </span>
      </div>
      <a href="https://event.nanoscientific.org/" target="_blank" style="margin-top: 20px; font-size: 13px">https://event.nanoscientific.org/
    </a></div>
  </body>
  `
  }
};