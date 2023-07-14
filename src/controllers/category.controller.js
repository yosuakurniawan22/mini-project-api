import Category from "../models/category.model";

async function getAllCategory(req, res) {
  try {
    const categories = await Category.findAll();

    return res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 500,
      message: `Internal server error`,
    });
  }
}

export default { getAllCategory } 