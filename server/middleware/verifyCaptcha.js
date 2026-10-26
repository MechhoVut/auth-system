const axios = require("axios");

const verifyCaptcha = async (req, res, next) => {
  try {
    const { captchaToken } = req.body;

    if (!captchaToken) {
      return res.status(400).json({ message: "Please complete the captcha" });
    }

    const params = new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: captchaToken,
    });

    const { data } = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      params
    );
    console.log("Google says:", data); 

    if (!data.success) {
      return res
        .status(400)
        .json({ message: "Captcha verification failed, try again" });
    }

    next();
  } catch (error) {
    console.error("Captcha error:", error.message);
    res.status(500).json({ message: "Could not verify captcha" });
  }
};

module.exports = verifyCaptcha;