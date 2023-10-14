import Link from "../models/Link.js";
import { nanoid } from "nanoid";
import baseUrl from "../connections/baserUrl.js";

let handelCreateLink = async (req, res) => {
  let { link, userId, title, description } = req.body;

  if (!link) return res.json({ status: "fail", message: "Empty link" });
  if (!userId)
    return res.json({ status: "fail", message: "User ID not found" });

  try {
    let findAllLinks = await Link.find({ userId });
    let allLinksLength = findAllLinks.length;

    if (allLinksLength >= 20) {
      return res.json({
        status: "fail",
        message: "Sorry, you've reached your limit of 20 links.",
      });
    }

    async function generateNewNonoId() {
      let shortId = nanoid(8);
      let checkShortid = await Link.findOne({ shortLink: shortId });
      if (checkShortid) {
        generateNewNonoId();
      } else {
        return shortId;
      }
    }
    let generateShortId = await Link.create({
      title,
      description,
      ogLink: link,
      shortLink: await generateNewNonoId(),
      userId,
    });

    res.json({
      status: "ok",
      message: "link created",
      clicks: generateShortId.totalClicks,
      shortLink: `${baseUrl}/${generateShortId.shortLink}`,
      title: generateShortId.title,
      description: generateShortId.description,
      _id: generateShortId._id,
    });
  } catch (error) {
    res.send(error.meesage);
  }
};
let handelGetAllLinks = async (req, res) => {
  let userId = req.params.userId;

  try {
    let findAllLinks = await Link.find({ userId });

    res.send(findAllLinks);
  } catch (error) {
    res.json({ status: "fail", message: error.message });
  }
};
let handelDeleteLink = async (req, res) => {
  let _id = req.params.id;
  try {
    let deleteLink = await Link.findByIdAndDelete({ _id });
    res.json({ status: "ok", message: deleteLink });
  } catch (error) {
    res.json({ status: "fail", message: error.message });
  }
};
export { handelCreateLink, handelGetAllLinks, handelDeleteLink };
