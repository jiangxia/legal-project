/**
 * 材料管理器
 * 用于管理案件材料，提供统一的材料处理接口
 */

const fs = require("fs");
const path = require("path");
const documentProcessor = require("../../core/document-processor");

class MaterialManager {
  /**
   * 构造函数
   *
   * @param {string} caseId - 案件ID
   */
  constructor(caseId) {
    this.caseId = caseId;
    this.materials = [];
    this.materialsDir = path.join(
      __dirname,
      "..",
      "..",
      "data",
      "cases",
      caseId,
      "materials"
    );

    // 确保材料目录存在
    if (!fs.existsSync(this.materialsDir)) {
      fs.mkdirSync(this.materialsDir, { recursive: true });
    }

    // 加载材料
    this.loadMaterials();
  }

  /**
   * 加载材料
   *
   * @returns {Array} - 材料列表
   */
  loadMaterials() {
    try {
      if (fs.existsSync(this.materialsDir)) {
        const files = fs.readdirSync(this.materialsDir);

        this.materials = files
          .filter((file) => file.endsWith(".json"))
          .map((file) => {
            const filePath = path.join(this.materialsDir, file);
            return JSON.parse(fs.readFileSync(filePath, "utf-8"));
          })
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }

      return this.materials;
    } catch (err) {
      console.error(`加载材料出错: ${err.message}`);
      return [];
    }
  }

  /**
   * 添加材料
   *
   * @param {string} materialName - 材料名称
   * @param {string} materialContent - 材料内容
   * @param {string} materialType - 材料类型（如：起诉状、答辩状等）
   * @returns {Object|null} - 添加的材料对象或null
   */
  addMaterial(materialName, materialContent, materialType = "一般材料") {
    try {
      const materialId = Date.now().toString();
      const materialObj = {
        id: materialId,
        name: materialName,
        content: materialContent,
        type: materialType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 添加到材料列表
      this.materials.push(materialObj);

      // 保存到文件
      const materialPath = path.join(this.materialsDir, `${materialId}.json`);
      documentProcessor.saveToFile(materialPath, materialObj, true);

      return materialObj;
    } catch (err) {
      console.error(`添加材料出错: ${err.message}`);
      return null;
    }
  }

  /**
   * 获取材料
   *
   * @param {string} materialId - 材料ID
   * @returns {Object|null} - 材料对象或null
   */
  getMaterial(materialId) {
    try {
      // 先从内存中查找
      const material = this.materials.find((m) => m.id === materialId);
      if (material) {
        return material;
      }

      // 如果内存中没有，尝试从文件中加载
      const materialPath = path.join(this.materialsDir, `${materialId}.json`);
      if (fs.existsSync(materialPath)) {
        const material = JSON.parse(fs.readFileSync(materialPath, "utf-8"));
        this.materials.push(material);
        return material;
      }

      return null;
    } catch (err) {
      console.error(`获取材料出错: ${err.message}`);
      return null;
    }
  }

  /**
   * 更新材料
   *
   * @param {string} materialId - 材料ID
   * @param {Object} updates - 要更新的字段
   * @returns {Object|null} - 更新后的材料对象或null
   */
  updateMaterial(materialId, updates) {
    try {
      const material = this.getMaterial(materialId);
      if (!material) {
        throw new Error(`材料不存在: ${materialId}`);
      }

      // 更新字段
      const updatedMaterial = {
        ...material,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // 更新内存中的材料
      const index = this.materials.findIndex((m) => m.id === materialId);
      if (index !== -1) {
        this.materials[index] = updatedMaterial;
      }

      // 保存到文件
      const materialPath = path.join(this.materialsDir, `${materialId}.json`);
      documentProcessor.saveToFile(materialPath, updatedMaterial, true);

      return updatedMaterial;
    } catch (err) {
      console.error(`更新材料出错: ${err.message}`);
      return null;
    }
  }

  /**
   * 删除材料
   *
   * @param {string} materialId - 材料ID
   * @returns {boolean} - 是否删除成功
   */
  deleteMaterial(materialId) {
    try {
      // 从内存中删除
      const index = this.materials.findIndex((m) => m.id === materialId);
      if (index !== -1) {
        this.materials.splice(index, 1);
      }

      // 从文件系统中删除
      const materialPath = path.join(this.materialsDir, `${materialId}.json`);
      if (fs.existsSync(materialPath)) {
        fs.unlinkSync(materialPath);
      }

      return true;
    } catch (err) {
      console.error(`删除材料出错: ${err.message}`);
      return false;
    }
  }

  /**
   * 获取所有材料
   *
   * @param {string} materialType - 可选的材料类型过滤
   * @returns {Array} - 材料列表
   */
  getAllMaterials(materialType = null) {
    if (materialType) {
      return this.materials.filter((m) => m.type === materialType);
    }
    return this.materials;
  }

  /**
   * 获取材料内容
   *
   * @param {string} materialId - 材料ID
   * @returns {string|null} - 材料内容或null
   */
  getMaterialContent(materialId) {
    const material = this.getMaterial(materialId);
    return material ? material.content : null;
  }

  /**
   * 获取所有材料内容
   *
   * @returns {Array<string>} - 所有材料内容的数组
   */
  getAllMaterialContents() {
    return this.materials.map((m) => m.content);
  }

  /**
   * 合并所有材料内容
   *
   * @returns {string} - 合并后的材料内容
   */
  getMergedMaterialContent() {
    return this.materials
      .map((m) => `## ${m.name}\n\n${m.content}`)
      .join("\n\n---\n\n");
  }

  /**
   * 导出材料
   *
   * @param {string} outputDir - 输出目录
   * @returns {boolean} - 是否导出成功
   */
  exportMaterials(outputDir) {
    try {
      // 确保输出目录存在
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // 导出所有材料
      this.materials.forEach((material) => {
        const fileName = `${material.name.replace(/[\/\\:*?"<>|]/g, "_")}.txt`;
        const filePath = path.join(outputDir, fileName);
        fs.writeFileSync(filePath, material.content, "utf-8");
      });

      // 导出合并后的材料
      const mergedFilePath = path.join(outputDir, "所有材料.txt");
      fs.writeFileSync(
        mergedFilePath,
        this.getMergedMaterialContent(),
        "utf-8"
      );

      return true;
    } catch (err) {
      console.error(`导出材料出错: ${err.message}`);
      return false;
    }
  }
}

module.exports = MaterialManager;
