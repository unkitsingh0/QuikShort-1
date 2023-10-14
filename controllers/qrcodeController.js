import Qrcode from "../models/Qrcode.js";

let handelCreateQrCodeText = async (req, res) => {
  let { text, userId, description, title } = req.body;
  try {
    if (!text) return res.json({ status: "fail", message: "Text Messing" });
    if (!userId)
      return res.json({ status: "fail", message: "UserId not found" });
    let addQrText = await Qrcode.create({ text, userId, description, title });
    res.json({ status: "ok", message: addQrText });
  } catch (error) {
    res.json({ status: "fail", message: error.message });
  }
};
let handelGetAllQrcodeTexts = async (req, res) => {
  let userId = req.params.userId;

  try {
    let findAllQrcodeText = await Qrcode.find({ userId });
    res.send(findAllQrcodeText);
  } catch (error) {
    res.json({ status: "fail", message: error.message });
  }
};
let handelDeleteQrcodeText = async (req, res) => {
  let _id = req.params.id;
  try {
    let deleteQrcode = await Qrcode.findByIdAndDelete({ _id });
    res.json({ status: "ok", message: deleteQrcode });
  } catch (error) {
    res.json({ status: "fail", message: error.message });
  }
};
export {
  handelCreateQrCodeText,
  handelGetAllQrcodeTexts,
  handelDeleteQrcodeText,
};
