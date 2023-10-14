import Link from "../models/Link.js";

let handelRedirectLink = async (req, res) => {
  let id = req.params.id;
  try {
    let checkId = await Link.findOne({ shortLink: id });
    if (!checkId) return res.json({ status: "fail", message: "invalid link" });
    let clicks = checkId.totalClicks + 1;
    await Link.updateOne({ shortLink: id }, { $set: { totalClicks: clicks } });
    res.redirect(checkId.ogLink);
  } catch (error) {
    res.send(error.message);
  }
};
export { handelRedirectLink };
