const fs = require('fs');
const path = require('path');

// 创建项目目录结构
const projectDir = 'china-data-query-api';
const dirs = ['routes', 'utils'];
dirs.forEach(dir => fs.mkdirSync(path.join(projectDir, dir), { recursive: true }));

// package.json
fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify({
  "name": "china-data-query-api",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "body-parser": "^1.20.2",
    "js-yaml": "^4.1.0",
    "express-openapi-validator": "^5.1.6",
    "chartjs-node-canvas": "^4.1.6",
    "axios": "^1.7.2",
    "winston": "^3.13.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0"
  }
}, null, 2));

// index.js
fs.writeFileSync(path.join(projectDir, 'index.js'), `import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import path from 'path';
import yaml from 'js-yaml';
import fs from 'fs';
import winston from 'winston';
import OpenApiValidator from 'express-openapi-validator';
import queryRoutes from './routes/query.js';
import searchRoutes from './routes/search.js';
import plottingRoutes from './routes/plotting.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// 日志设置
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// 中间件
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

// 加载 OpenAPI 规范
const openApiSpec = yaml.load(fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8'));

// OpenAPI 验证器
app.use(OpenApiValidator.middleware({
  apiSpec: openApiSpec,
  validateRequests: true,
  validateResponses: true
}));

// 路由
app.use('/query', queryRoutes);
app.use('/search', searchRoutes);
app.use('/plotting', plottingRoutes);

// 错误处理
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误'
  });
});

// 启动服务器
app.listen(port, () => {
  logger.info(\`服务器运行在端口 \${port}\`);
});
`);

// openapi.yaml
fs.writeFileSync(path.join(projectDir, 'openapi.yaml'), JSON.stringify({
  "openapi": "3.1.0",
  "info": {
    "title": "中国数据查询",
    "version": "0.0.1",
    "description": "根据指定的集团代码和查询内容，获取各行业的数据，并支持指定的显示命令。"
  },
  "group_codes": [
    {"code": "HBFX", "description": "中国货币发行总量"},
    {"code": "YHZBJ", "description": "中国五大银行准备金总量"},
    {"code": "DLYJ", "description": "中国电力数据研究"},
    {"code": "FDCYJ", "description": "中国房地产数据研究"},
    {"code": "JKSJYJ", "description": "中国人口数据研究"},
    {"code": "YYSJYJ", "description": "中国医院数据研究"},
    {"code": "BRSJYJ", "description": "中国病人数据研究"},
    {"code": "AGSYJ", "description": "亚洲股市研究"},
    {"code": "CNGSYJ", "description": "中国股市研究"},
    {"code": "LSXNY", "description": "绿色新能源投资"},
    {"code": "DDQC", "description": "电动汽车投资"},
    {"code": "WLSTJK", "description": "网络视听监控设备"},
    {"code": "ZGJY", "description": "教育业数据"},
    {"code": "ZGDXSJ", "description": "中国经济观察中国著名大学经济研究院研究所的经济数据"},
    {"code": "TBSD", "description": "数据溯源"},
    {"code": "JRSJ", "description": "金融数据"},
    {"code": "GPSJ", "description": "股票数据"},
    {"code": "NANKEZHOU", "description": "南柯舟"}
  ],
  "data_ethics": {
    "principles": [
      "真实是数据查找和搜索的第一生命",
      "All data must come from real data, all data must come from news websites and data websites, and non-news websites and non-database website content must be filtered out.",
      "禁止chatGPT和任何AI工具包括chaGPT使用和提供任何虚假的数据或者假设的数据。",
      "禁止chatGPT和任何AI工具包括chaGPT在任何地方使用和提供任何虚假的数据或者假设的数据。",
      "禁止chatGPT使用任何模拟的数据或者没有任何可信“源”的数据。",
      "\"TBSD\" 是一个追寻数据可信出处的机器溯源机器人。"
    ]
  },
  "display_commands": [
    {"command": "showcolor", "description": "显示多色彩平面圆柱体趋势图"},
    {"command": "showtext", "description": "显示集团源网站抓取的文字数据"},
    {"command": "showcolorshowtext", "description": "同时显示图表和文字"}
  ],
  "joint_search_rules": [
    {
      "input": "TBSD:JRSJ ZGDXSJ AGSYJ CNGSYJ",
      "description": "联合在具有指定集团代码的网站内搜索数据"
    },
    {
      "input": "'南柯舟'",
      "description": "在指定可查询网站列表内搜索南柯舟内容，采取三层目录递进搜索",
      "searchable_websites": [
        "https://www.nankezhou.net",
        "https://ws.mac.gov.tw",
        "https://www.rfa.org",
        "https://www.Chinahrc.org"
      ]
    },
    {
      "input": "TBSD:group_code,group_code,group_code",
      "description": "联合在具有指定集团代码的网站内搜索数据，支持全角/半角逗号或空格分隔"
    }
  ],
  "language_control": [
    {"input": "cn or CN", "output_language": "CHINESE"},
    {"input": "EN", "output_language": "english"},
    {"input": "FR", "output_language": "Français"}
  ],
  "data_authenticity_commands": [
    {"command": "Noass", "description": "禁止使用任何假设的数据和来源"},
    {"command": "Fdp", "description": "禁止使用任何虚构的数据和来源"},
    {"command": "Dmd", "description": "禁止使用任何模拟的数据和来源"},
    {"command": "chatGPTNoass", "description": "禁止chatGPT使用任何假设的数据和来源"},
    {"command": "chatGPTFdp", "description": "禁止chatGPT使用任何虚构的数据和来源"},
    {"command": "chatGPTDmd", "description": "禁止chatGPT使用任何模拟的数据和来源"},
    {"command": "chatGPTUNtr", "description": "禁止chatGPT使用任何非可信源的数据和来源"}
  ],
  "data_tracing_logic": {
    "TBSD": {
      "description": "追寻数据可信出处的机器溯源机器人",
      "levels": [
        "追寻数据可信出处",
        "追寻数据原始出处",
        "追寻数据出处"
      ],
      "method": "采取三个层的迭代穷举：网站\\子目录\\孙目录\\子孙目录",
      "parameters": [
        {"param": "-deep", "description": "在各个集团进行广泛溯源，说明数据来源"},
        {"param": "-net", "description": "在互联网上进行溯源，优先使用数据溯源集团的源列表网站，说明数据来源"}
      ]
    }
  },
  "update_control_commands": [
    {
      "command": ["UPGRADE", "UP", "UPDATA", "DATAUP"],
      "description": "立即执行更新查询，向所属集团内网站校对更新新数据"
    },
    {
      "command": ["nankezhou", "南柯舟"],
      "description": "立即在指定网站搜索南柯舟文字内容",
      "websites": [
        "https://www.nankezhou.net",
        "https://ws.mac.gov.cn",
        "https://www.rfa.org",
        "https://www.Chinahrc.org"
      ]
    },
    {"command": "CHECKVERSION", "description": "返回最新数据版本号或更新时间戳"}
  ],
  "date_formats": {
    "single_date": ["YYYY-MM-DD", "YYYY.MM.DD", "YYYY-MM.DD", "YYYY.MM-DD", "YYYYMMDD"],
    "year_month": ["YYYY-MM", "YYYYMM", "YYYY.MM", "YY.MM", "YY-MM"],
    "month_day": ["MM-DD", "MMDD", "MM.DD"],
    "range_date": ["YYYY-MM-DD YYYY-MM-DD", "YYYY.MM.DD YYYY.MM.DD"],
    "range_year_month": ["YYYY-MM YYYY-MM", "YYYY.MM YYYY.MM"],
    "range_month_day": ["MM-DD MM-DD", "MM.DD MM-DD"],
    "separators": ["-", "to", " "],
    "year_format": ["YYYY", "YY"],
    "month_format": ["MM", "M"]
  },
  "query_examples": [
    {
      "input": "showcolor JKSJYJ+2013-01-01 to 2023.10.01",
      "description": "查询JKSJYJ集团2013-01-01至2023-10-01数据，以多色彩平面圆柱体趋势图显示"
    },
    {
      "input": "SHGS or SSE",
      "description": "在CNGSYJ集团内查询SSE Composite Index数据"
    },
    {
      "input": "showcolor CNGSYJ+HK1919 13-1-1 to 23-10-1",
      "description": "查询CNGSYJ集团港股代码1919的股票数据，2013-01-01至2023-10-01，以多色彩平面圆柱体趋势图显示"
    },
    {
      "input": "showcolor ZGJY+在校大学生党员总数+2020",
      "description": "查询ZGJY集团2020年在校大学生党员总数，以多色彩平面圆柱体趋势图显示"
    }
  ],
  "stock_indicators": {
    "trend_indicators": [
      {"code": "MACD", "description": "平滑异同移动平均线，判断买卖时机"},
      {"code": "TRIX", "description": "三重指数平滑移动平均，反映长期波动趋势"},
      {"code": "DMI", "description": "趋向指标，判断价格趋势和买卖信号"},
      {"code": "EXPMA", "description": "指数平均数，准确反映股价趋势"},
      {"code": "BOLL", "description": "布林线指标，判断高低位风险"}
    ],
    "strength_indicators": [
      {"code": "RSI", "description": "相对强弱指标，分析买卖信号和超买超卖"},
      {"code": "WR", "description": "威廉指标，判断超买超卖"},
      {"code": "CCI", "description": "顺势指标，测量价格超出常态分布"},
      {"code": "ROC", "description": "变动率指标，测量价格变动速度和方向"}
    ],
    "other_indicators": [
      {"code": "KDJ", "description": "随机指标，判断超买超卖和趋势变化"},
      {"code": "BIAS", "description": "乖离率，反映股价与移动平均线偏离程度"},
      {"code": "OBV", "description": "能量潮指标，预测股价走势"},
      {"code": "ASI", "description": "振动升降指标，研判市场气势"},
      {"code": "EMV", "description": "简易波动指标，衡量股价波动"},
      {"code": "WVAD", "description": "威廉变异离散量，观察成交量对股价影响"},
      {"code": "SAR", "description": "停损点转向指标，设定止损点位"},
      {"code": "CR", "description": "中间意愿指标，分析股价中间值波动"},
      {"code": "VR", "description": "成交量变异率，测量股价热度"},
      {"code": "MIKE", "description": "麦克指标，判断价格趋势和买卖信号"},
      {"code": "心理线", "description": "研究投资者心理趋向，判断未来走势"}
    ]
  },
  "servers": [
    {"url": "http://localhost:3000", "description": "本地开发服务器"}
  ],
  "paths": {
    "/query": {
      "post": {
        "summary": "根据集团代码和查询内容获取数据，并以指定的颜色和图表类型显示。",
        "operationId": "QueryChinaData",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "input": {"type": "string", "description": "用户输入的命令和查询内容，例如：\"showcolor HBFX+查询内容\"。"}
                },
                "required": ["input"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "成功响应。",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "group_code": {"type": "string", "description": "查询的集团代码。"},
                    "display_command": {"type": "string", "description": "显示命令，例如：showcolor、showtext 或 showcolorshowtext。"},
                    "results": {"$ref": "#/components/schemas/DataList"}
                  },
                  "required": ["group_code", "display_command", "results"]
                }
              }
            }
          },
          "400": {"description": "错误的请求。", "content": {"application/json": {"schema": {"$ref": "#/components/schemas/ErrorResponse"}}}},
          "500": {"description": "服务器内部错误。", "content": {"application/json": {"schema": {"$ref": "#/components/schemas/ErrorResponse"}}}}
        }
      }
    },
    "/search": {
      "get": {
        "operationId": "get_search",
        "summary": "搜索 ETOOL Group 经济研究网站",
        "tags": ["ETOOL Group"],
        "parameters": [
          {"name": "query", "in": "query", "description": "搜索经济研究网站的关键词", "required": true, "schema": {"type": "string"}},
          {"name": "limit", "in": "query", "description": "返回的最大结果数（默认 10，最大 50）", "schema": {"type": "integer", "default": 10, "maximum": 50}},
          {"name": "offset", "in": "query", "description": "结果偏移量（分页用）", "schema": {"type": "integer", "default": 0}}
        ],
        "responses": {
          "200": {
            "description": "匹配的研究网站列表",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "results": {"type": "array", "items": {"$ref": "#/components/schemas/ResearchSite"}},
                    "count": {"type": "integer", "description": "匹配的结果数量"}
                  }
                }
              }
            }
          }
        }
      }
    },
    "/plotting/line_chart": {
      "post": {
        "summary": "生成折线图",
        "tags": ["Plotting"],
        "operationId": "SHOWZXT",
        "requestBody": {"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/PlotRequest"}}}},
        "responses": {"200": {"description": "折线图生成成功", "content": {"application/json": {"schema": {"$ref": "#/components/schemas/PlotResponse"}}}}}
      }
    },
    "/plotting/bar_chart": {
      "post": {
        "summary": "生成条形图",
        "tags": ["Plotting"],
        "operationId": "SHOWTXT",
        "requestBody": {"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/PlotRequest"}}}},
        "responses": {"200": {"description": "条形图生成成功", "content": {"application/json": {"schema": {"$ref": "#/components/schemas/PlotResponse"}}}}}
      }
    },
    "/plotting/column_chart": {
      "post": {
        "summary": "生成柱状图",
        "tags": ["Plotting"],
        "operationId": "showzzt",
        "requestBody": {"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/PlotRequest"}}}},
        "responses": {"200": {"description": "柱状图生成成功", "content": {"application/json": {"schema": {"$ref": "#/components/schemas/PlotResponse"}}}}}
      }
    },
    "/plotting/pie_chart": {
      "post": {
        "summary": "生成饼图",
        "tags": ["Plotting"],
        "operationId": "SHOWBT",
        "requestBody": {"required": true, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/PieChartRequest"}}}},
        "responses": {"200": {"description": "饼图生成成功", "content": {"application/json": {"schema": {"$ref": "#/components/schemas/PlotResponse"}}}}}
      }
    }
  },
  "components": {
    "schemas": {
      "ResearchSite": {
        "type": "object",
        "properties": {
          "url": {"type": "string", "example": "https://www.brookings.edu/"},
          "description": {"type": "string", "example": "Brookings Institution - 美国著名智库，研究全球经济繁荣和衰退问题"},
          "group_code": {"type": "string", "example": "ETOOL"}
        },
        "required": ["url", "description", "group_code"]
      },
      "DataList": {
        "type": "object",
        "properties": {"data": {"type": "array", "items": {"$ref": "#/components/schemas/DataItem"}}},
        "required": ["data"]
      },
      "DataItem": {
        "type": "object",
        "properties": {
          "indicator": {"type": "string", "description": "指标名称。"},
          "value": {"type": "number", "format": "float", "description": "指标数值。"},
          "date": {"type": "string", "description": "数据日期，支持格式：YYYY-MM-DD、YYYY.MM.DD、YYYYMMDD、YYYY-MM、YYYYMM、MM-DD、MMDD 等。", "pattern": "^(\\d{4}([-\\.\\s]?\\d{2}([-\\.\\s]?\\d{2})?)?|\\d{2}([-\\.\\s]?\\d{2})?|\\d{1,2}[-\\.\\s]\\d{1,2})$"}
        },
        "required": ["indicator", "value", "date"]
      },
      "ErrorResponse": {
        "type": "object",
        "properties": {"error": {"type": "string", "description": "错误信息。"}},
        "required": ["error"]
      },
      "PlotRequest": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {"x": {"type": "number"}, "y": {"type": "number"}},
              "required": ["x", "y"]
            }
          }
        },
        "required": ["data"]
      },
      "PieChartRequest": {
        "type": "object",
        "properties": {
          "labels": {"type": "array", "items": {"type": "string"}},
          "values": {"type": "array", "items": {"type": "number"}}
        },
        "required": ["labels", "values"]
      },
      "PlotResponse": {
        "type": "object",
        "properties": {"imageUrl": {"type": "string", "format": "uri"}},
        "required": ["imageUrl"]
      }
    },
    "examples": {
      "SearchQueryExample": {"value": {"query": "经济繁荣"}},
      "SourcesExample": {
        "value": {
          "sources": [
            {"url": "https://www.federalreserve.gov/", "description": "Federal Reserve（美联储，美元发行数据）", "group_code": "Retroactive"},
            {"url": "https://scholar.google.com/", "description": "Google Scholar（谷歌学术）", "group_code": "Retroactive"},
            {"url": "https://www.cnki.net/", "description": "CNKI（中国知网）", "group_code": "Retroactive"},
            {"url": "https://www.ssrn.com/", "description": "SSRN（Social Science Research Network）", "group_code": "Retroactive"},
            {"url": "https://www.webofscience.com/", "description": "Web of Science", "group_code": "Retroactive"},
            {"url": "https://www.scopus.com/", "description": "Scopus", "group_code": "Retroactive"},
            {"url": "https://www.wanfangdata.com.cn/", "description": "万方数据", "group_code": "Retroactive"},
            {"url": "http://cssci.nju.edu.cn/", "description": "CSSCI（中文社会科学引文索引）", "group_code": "Retroactive"},
            {"url": "https://link.springer.com/", "description": "SpringerLink", "group_code": "Retroactive"},
            {"url": "https://www.sciencedirect.com/", "description": "Elsevier's ScienceDirect", "group_code": "Retroactive"},
            {"url": "https://www.jstor.org/", "description": "JSTOR", "group_code": "Retroactive"},
            {"url": "http://econ.pku.edu.cn/", "description": "北京大学经济学院", "group_code": "ZGDXSJ"},
            {"url": "http://www.sem.tsinghua.edu.cn/", "description": "清华大学经济管理学院", "group_code": "ZGDXSJ"},
            {"url": "http://econ.fudan.edu.cn/", "description": "复旦大学经济学院", "group_code": "ZGDXSJ"},
            {"url": "https://econ.shufe.edu.cn/", "description": "上海财经大学经济学院", "group_code": "ZGDXSJ"},
            {"url": "http://www.cee.zju.edu.cn/", "description": "浙江大学经济学院", "group_code": "ZGDXSJ"},
            {"url": "http://www.wise.xmu.edu.cn/", "description": "厦门大学金融学院", "group_code": "ZGDXSJ"},
            {"url": "http://ie.cass.cn/", "description": "中国社会科学院经济研究所", "group_code": "ZGDXSJ"},
            {"url": "http://econ.ruc.edu.cn/", "description": "中国人民大学经济学院", "group_code": "ZGDXSJ", "additional_info": "中国人民大学也通过其研究平台发布国内生产总值和经济增长的分析报告。"},
            {"url": "https://www.ceibs.edu/", "description": "中欧国际工商学院", "group_code": "ZGDXSJ", "additional_info": "中欧国际工商学院通过其研究项目和年度经济报告，提供了对中国经济和GDP增长的分析。"},
            {"url": "https://nankezhou.net/", "description": "南柯舟 Official Website", "group_code": "NANKEZHOU"},
            {"url": "https://ws.mac.gov.tw/", "description": "Taiwan Mainland Affairs Council Official Website", "group_code": "NANKEZHOU"},
            {"url": "https://www.rfa.org/", "description": "Radio Free Asia", "group_code": "NANKEZHOU"},
            {"url": "https://www.Chinahrc.org/", "description": "Human Rights China Official Website", "group_code": "NANKEZHOU"},
            {"url": "http://www.pbc.gov.cn/", "description": "中国人民银行官网, 简称：PBOC", "group_code": "JRSJ"},
            {"url": "https://www.federalreserve.gov/", "description": "美联储官网, 简称：Federal Reserve", "group_code": "JRSJ"},
            {"url": "https://www.ecb.europa.eu/", "description": "欧洲央行官网, 简称：ECB", "group_code": "JRSJ"},
            {"url": "https://www.bloomberg.com/professional/", "description": "彭博终端, 简称：Bloomberg", "group_code": "JRSJ"},
            {"url": "https://www.reuters.com/", "description": "路透社, 简称：Reuters", "group_code": "JRSJ"},
            {"url": "http://www.wind.com.cn/", "description": "Wind资讯, 简称：Wind Info", "group_code": "JRSJ"},
            {"url": "https://ec.europa.eu/eurostat/web/main/data/database", "description": "欧盟统计局 API, 简称：Eurostat", "group_code": "JRSJ"},
            {"url": "https://fred.stlouisfed.org/", "description": "美联储经济数据 FRED API, 简称：FRED", "group_code": "JRSJ"},
            {"url": "https://www.chinabond.com.cn/", "description": "中国金融数据 API, 简称：China Financial API", "group_code": "JRSJ"},
            {"url": "https://www.ft.com/", "description": "金融时报, 简称：FT", "group_code": "JRSJ"},
            {"url": "https://www.wsj.com/", "description": "华尔街日报, 简称：WSJ", "group_code": "JRSJ"},
            {"url": "http://www.stats.gov.cn/", "description": "中国国家统计局", "group_code": "JRSJ"},
            {"url": "https://www.census.gov/", "description": "美国统计局", "group_code": "JRSJ"},
            {"url": "https://data.imf.org/", "description": "IMF 数据库", "group_code": "JRSJ"},
            {"url": "https://databank.worldbank.org/", "description": "世界银行发展指标", "group_code": "JRSJ"},
            {"url": "http://www.stats.gov.cn/", "description": "国家统计局", "group_code": "HBFX"},
            {"url": "http://www.pbc.gov.cn/", "description": "中国人民银行", "group_code": "HBFX"},
            {"url": "http://finance.sina.com.cn/", "description": "新浪财经", "group_code": "HBFX"},
            {"url": "http://finance.qq.com/", "description": "腾讯财经", "group_code": "HBFX"},
            {"url": "http://www.china.com.cn/economic/", "description": "中国网经济频道", "group_code": "HBFX"},
            {"url": "https://www.ecb.europa.eu/", "description": "欧洲央行，欧元发行数据", "group_code": "HBFX"},
            {"url": "https://www.federalreserve.gov/", "description": "美联储，美元发行数据", "group_code": "HBFX"},
            {"url": "https://tradingeconomics.com/china/gdp", "description": "Trading Economics", "group_code": "HBFX"},
            {"url": "https://tradingeconomics.com/china/gdp-growth", "description": "Trading Economics-growth", "group_code": "HBFX"},
            {"url": "https://www.bloomberg.com/", "description": "彭博社", "group_code": "USSM"},
            {"url": "https://www.reuters.com/", "description": "路透社", "group_code": "USSM"},
            {"url": "https://www.marketwatch.com/", "description": "MarketWatch", "group_code": "USSM"},
            {"url": "https://www.cnbc.com/", "description": "CNBC", "group_code": "USSM"},
            {"url": "https://www.wsj.com/", "description": "华尔街日报", "group_code": "USSM"},
            {"url": "http://www.stats.gov.cn/", "description": "国家统计局", "group_code": "YHZBJ"},
            {"url": "http://www.icbc.com.cn/", "description": "中国工商银行", "group_code": "YHZBJ"},
            {"url": "http://www.ccb.com/", "description": "中国建设银行", "group_code": "YHZBJ"},
            {"url": "http://www.abchina.com/", "description": "中国农业银行", "group_code": "YHZBJ"},
            {"url": "http://www.boc.cn/", "description": "中国银行", "group_code": "YHZBJ"},
            {"url": "http://www.stats.gov.cn/", "description": "国家统计局", "group_code": "DLYJ"},
            {"url": "http://www.cec.org.cn/", "description": "中国电力企业联合会", "group_code": "DLYJ"},
            {"url": "http://www.sgcc.com.cn/", "description": "国家电网", "group_code": "DLYJ"},
            {"url": "http://www.chinapower.com.cn/", "description": "中电传媒", "group_code": "DLYJ"},
            {"url": "http://www.nea.gov.cn/", "description": "国家能源局", "group_code": "DLYJ"},
            {"url": "http://www.stats.gov.cn/", "description": "国家统计局", "group_code": "FDCYJ"},
            {"url": "http://www.creis.cn/", "description": "中国房地产指数系统", "group_code": "FDCYJ"},
            {"url": "http://www.fang.com/", "description": "房天下", "group_code": "FDCYJ"},
            {"url": "http://fdc.fang.com/", "description": "中国房地产信息网", "group_code": "FDCYJ"},
            {"url": "http://www.cres.cn/", "description": "中国房地产研究会", "group_code": "FDCYJ"},
            {"url": "http://www.stats.gov.cn/", "description": "国家统计局", "group_code": "JKSJYJ"},
            {"url": "http://www.chinapop.gov.cn/", "description": "中国人口网", "group_code": "JKSJYJ"},
            {"url": "http://www.nhc.gov.cn/", "description": "国家卫生健康委员会", "group_code": "JKSJYJ"},
            {"url": "http://www.cpirc.org.cn/", "description": "中国人口与发展研究中心", "group_code": "JKSJYJ"},
            {"url": "http://www.cnpopulation.cn/", "description": "中国人口信息网", "group_code": "JKSJYJ"},
            {"url": "http://www.stats.gov.cn/", "description": "国家统计局", "group_code": "YYSJYJ"},
            {"url": "http://www.nhc.gov.cn/", "description": "国家卫生健康委员会", "group_code": "YYSJYJ"},
            {"url": "http://www.chinayxj.org.cn/", "description": "中国医院协会", "group_code": "YYSJYJ"},
            {"url": "http://www.cn-healthcare.com/", "description": "健康界", "group_code": "YYSJYJ"},
            {"url": "http://www.hc3i.cn/", "description": "HC3i中国数字医疗网", "group_code": "YYSJYJ"},
            {"url": "http://www.stats.gov.cn/", "description": "国家统计局", "group_code": "BRSJYJ"},
            {"url": "http://www.chinacdc.cn/", "description": "中国疾病预防控制中心", "group_code": "BRSJYJ"},
            {"url": "http://www.nhc.gov.cn/", "description": "国家卫生健康委员会", "group_code": "BRSJYJ"},
            {"url": "http://www.chinacdc.cn/jkzt/", "description": "中国疾病预防控制中心健康主题", "group_code": "BRSJYJ"},
            {"url": "http://www.chinacdc.cn/ghdcrjc/", "description": "中国疾病监测系统", "group_code": "BRSJYJ"},
            {"url": "http://www.stats.gov.cn/", "description": "国家统计局", "group_code": "AGSYJ"},
            {"url": "https://www.hkex.com.hk/", "description": "香港交易所", "group_code": "AGSYJ"},
            {"url": "https://www.jpx.co.jp/english/", "description": "日本交易所集团", "group_code": "AGSYJ"},
            {"url": "https://www.twse.com.tw/en/", "description": "台湾证券交易所", "group_code": "AGSYJ"},
            {"url": "https://www.krx.co.kr/main/main.jsp", "description": "韩国交易所", "group_code": "AGSYJ"},
            {"url": "http://www.stats.gov.cn/", "description": "国家统计局", "group_code": "CNGSYJ"},
            {"url": "http://www.sse.com.cn/", "description": "上海证券交易所", "group_code": "CNGSYJ"},
            {"url": "http://www.szse.cn/", "description": "深圳证券交易所", "group_code": "CNGSYJ"},
            {"url": "http://www.csrc.gov.cn/", "description": "中国证券监督管理委员会", "group_code": "CNGSYJ"},
            {"url": "http://www.chinafund.cn/", "description": "中国基金网", "group_code": "CNGSYJ"},
            {"url": "http://www.stats.gov.cn/", "description": "国家统计局", "group_code": "LSXNY"},
            {"url": "http://www.nea.gov.cn/", "description": "国家能源局", "group_code": "LSXNY"},
            {"url": "http://www.cnea.org.cn/", "description": "中国新能源网", "group_code": "LSXNY"},
            {"url": "http://www.china-nengyuan.com/", "description": "中国能源网", "group_code": "LSXNY"},
            {"url": "http://www.cec.org.cn/", "description": "中国电力企业联合会", "group_code": "LSXNY"},
            {"url": "http://www.stats.gov.cn/", "description": "国家统计局", "group_code": "DDQC"},
            {"url": "http://www.caam.org.cn/", "description": "中国汽车工业协会", "group_code": "DDQC"},
            {"url": "http://www.chinaev.org/", "description": "中国电动汽车网", "group_code": "DDQC"},
            {"url": "http://www.evtimes.cn/", "description": "电动汽车时代网", "group_code": "DDQC"},
            {"url": "http://www.d1ev.com/", "description": "第一电动网", "group_code": "DDQC"},
            {"url": "http://www.stats.gov.cn/", "description": "国家统计局", "group_code": "WLSTJK"},
            {"url": "http://www.cnnic.cn/", "description": "中国互联网络信息中心", "group_code": "WLSTJK"},
            {"url": "http://www.china-ciaa.org/", "description": "中国安防行业网", "group_code": "WLSTJK"},
            {"url": "http://www.cps.com.cn/", "description": "中国公共安全网", "group_code": "WLSTJK"},
            {"url": "http://www.infosec.org.cn/", "description": "中国信息安全测评中心", "group_code": "WLSTJK"},
            {"url": "http://www.stats.gov.cn/", "description": "国家统计局", "group_code": "ZGJY"},
            {"url": "https://so.moe.gov.cn/s?qt=", "description": "教育部统计搜索引擎", "group_code": "ZGJY"},
            {"url": "http://www.edustat.org.cn/", "description": "全国教育统计信息网", "group_code": "ZGJY"},
            {"url": "http://www.chinaheac.com/", "description": "中国高等教育学会", "group_code": "ZGJY"},
            {"url": "http://www.jczxjy.com/", "description": "中国基础教育网", "group_code": "ZGJY"}
          ]
        }
      }
    }
  },
  "tags": [
    {
      "name": "ETOOL Group",
      "description": "Economic Tools Research Sites"
    },
    {
      "name": "Plotting",
      "description": "Chart generation endpoints"
    }
  ],
  "x-etooleGroupSites": [
    {
      "url": "https://www.brookings.edu/",
      "description": "Brookings Institution - 美国著名智库，研究全球经济繁荣和衰退问题",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.nber.org/",
      "description": "National Bureau of Economic Research (NBER) - 美国国家经济研究局，经济波动与增长研究",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.cepr.org/",
      "description": "Centre for Economic Policy Research (CEPR) - 欧洲经济政策研究中心",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.iif.com/",
      "description": "Institute of International Finance (IIF) - 研究全球经济增长与风险",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.imf.org/",
      "description": "International Monetary Fund (IMF) - 国际货币基金组织，研究经济衰退与上行问题",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.weforum.org/",
      "description": "World Economic Forum (WEF) - 世界经济论坛，研究全球经济繁荣和衰退",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.oecd.org/",
      "description": "Organisation for Economic Co-operation and Development (OECD) - 经济合作与发展组织，研究经济增长与下降",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.rand.org/",
      "description": "RAND Corporation - 研究经济疲惫与活力的顶尖智库",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.chathamhouse.org/",
      "description": "Chatham House - 伦敦智库，研究全球经济走势",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.bruegel.org/",
      "description": "Bruegel - 欧洲领先经济研究中心，研究经济增长和下行趋势",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.rieti.go.jp/en/",
      "description": "The Research Institute of Economy, Trade and Industry (RIETI) - 日本经济、贸易和产业研究所，专注经济发展",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.csis.org/",
      "description": "Center for Strategic and International Studies (CSIS) - 国际经济与国家强大研究",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.asiapacific.ca/",
      "description": "Asia Pacific Foundation - 亚太地区经济发展研究",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.cfr.org/",
      "description": "Council on Foreign Relations (CFR) - 经济与国际关系研究",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.iie.com/",
      "description": "Peterson Institute for International Economics - 国际经济繁荣与衰退研究",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.wider.unu.edu/",
      "description": "UNU-WIDER - 联合国大学世界发展经济研究所，研究全球经济不平等",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.cigionline.org/",
      "description": "Centre for International Governance Innovation (CIGI) - 经济增长与全球治理研究",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.boc.cn/",
      "description": "Bank of China (BOC) - 中国银行，研究国家强大与金融政策",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.carnegieendowment.org/",
      "description": "Carnegie Endowment for International Peace - 国际经济与安全研究",
      "group_code": "ETOOL"
    },
    {
      "url": "https://www.pbc.gov.cn/",
      "description": "中国人民银行 - 国家经济与货币政策研究",
      "group_code": "ETOOL"
    }
  ],
  "x-status": "success",
  "x-message": "API data update completed successfully.",
  "x-last_updated": "2024-10-04T12:00:00Z",
  "x-version": "v1.1.1",
  "x-data_sources": [
    {
      "name": "CurrencyDataAPI",
      "status": "updated",
      "last_sync": "2024-10-04T11:55:00Z"
    },
    {
      "name": "StockMarketAPI",
      "status": "updated",
      "last_sync": "2024-10-04T11:50:00Z"
    },
    {
      "name": "RealEstateAPI",
      "status": "failed",
      "last_sync": "2024-10-04T11:45:00Z",
      "error": "Connection timeout"
    }
  ]
}, null, 2));

// routes/query.js
fs.writeFileSync(path.join(projectDir, 'routes/query.js'), `import express from 'express';
import { validateDataSource } from '../utils/dataValidation.js';
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { input } = req.body;
    if (!input) {
      return res.status(400).json({ error: '输入是必需的' });
    }

    // 解析输入（例如 "showcolor HBFX+2020"）
    const [displayCommand, query] = input.split('+');
    const [groupCode, ...queryParts] = query.split(' ');

    // 验证集团代码
    const validGroupCodes = ['HBFX', 'YHZBJ', 'DLYJ', 'FDCYJ', 'JKSJYJ', 'YYSJYJ', 'BRSJYJ', 'AGSYJ', 'CNGSYJ', 'LSXNY', 'DDQC', 'WLSTJK', 'ZGJY', 'ZGDXSJ', 'TBSD', 'JRSJ', 'GPSJ', 'NANKEZHOU'];
    if (!validGroupCodes.includes(groupCode)) {
      return res.status(400).json({ error: '无效的集团代码' });
    }

    // 验证显示命令
    const validDisplayCommands = ['showcolor', 'showtext', 'showcolorshowtext'];
    if (!validDisplayCommands.includes(displayCommand)) {
      return res.status(400).json({ error: '无效的显示命令' });
    }

    // 模拟数据检索
    const data = await validateDataSource(groupCode, queryParts.join(' '));
    
    res.status(200).json({
      group_code: groupCode,
      display_command: displayCommand,
      results: { data }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
`);

// routes/search.js
fs.writeFileSync(path.join(projectDir, 'routes/search.js'), `import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  const { query, limit = 10, offset = 0 } = req.query;
  if (!query) {
    return res.status(400).json({ error: '查询参数是必需的' });
  }

  // 模拟搜索结果
  const allResults = [
    {
      url: 'https://www.brookings.edu/',
      description: 'Brookings Institution - 美国著名智库',
      group_code: 'ETOOL'
    },
    {
      url: 'https://www.nber.org/',
      description: 'National Bureau of Economic Research',
      group_code: 'ETOOL'
    }
  ];

  const results = allResults
    .filter(r => r.description.toLowerCase().includes(query.toLowerCase()))
    .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

  res.status(200).json({
    results,
    count: results.length
  });
});

export default router;
`);

// routes/plotting.js
fs.writeFileSync(path.join(projectDir, 'routes/plotting.js'), `import express from 'express';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
const router = express.Router();

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 600 });

router.post('/line_chart', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: '无效的数据格式' });
    }

    const configuration = {
      type: 'line',
      data: {
        labels: data.map(d => d.x),
        datasets: [{
          label: '数据',
          data: data.map(d => d.y),
          borderColor: 'blue',
          fill: false
        }]
      }
    };

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    const imageUrl = \`data:image/png;base64,\${imageBuffer.toString('base64')}\`;

    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/bar_chart', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: '无效的数据格式' });
    }

    const configuration = {
      type: 'bar',
      data: {
        labels: data.map(d => d.x),
        datasets: [{
          label: '数据',
          data: data.map(d => d.y),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      }
    };

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    const imageUrl = \`data:image/png;base64,\${imageBuffer.toString('base64')}\`;

    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/pie_chart', async (req, res) => {
  try {
    const { labels, values } = req.body;
    if (!labels || !values || !Array.isArray(labels) || !Array.isArray(values)) {
      return res.status(400).json({ error: '无效的数据格式' });
    }

    const configuration = {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: ['red', 'blue', 'green', 'yellow', 'purple']
        }]
      }
    };

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    const imageUrl = \`data:image/png;base64,\${imageBuffer.toString('base64')}\`;

    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/column_chart', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: '无效的数据格式' });
    }

    const configuration = {
      type: 'bar',
      data: {
        labels: data.map(d => d.x),
        datasets: [{
          label: '数据',
          data: data.map(d => d.y),
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }]
      }
    };

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    const imageUrl = \`data:image/png;base64,\${imageBuffer.toString('base64')}\`;

    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
`);

// utils/dataValidation.js
fs.writeFileSync(path.join(projectDir, 'utils/dataValidation.js'), `import axios from 'axios';
import yaml from 'js-yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const openApiSpec = yaml.load(fs.readFileSync(path.join(__dirname, '../openapi.yaml'), 'utf8'));
const validSources = openApiSpec.components.examples.SourcesExample.value.sources;

export async function validateDataSource(groupCode, query) {
  // 验证数据源
  const source = validSources.find(s => s.group_code === groupCode);
  if (!source) {
    throw new Error('未找到指定集团代码的有效数据源');
  }

  // 模拟数据检索
  try {
    return [
      {
        indicator: query,
        value: Math.random() * 100,
        date: '2023-01-01'
      }
    ];
  } catch (error) {
    throw new Error('从数据源获取数据失败');
  }
}
`);

// README.md
fs.writeFileSync(path.join(projectDir, 'README.md'), `# 中国数据查询 API

一个实现 OpenAPI 3.1.0 规范的 Node.js API，用于查询中国各行业数据。

## 设置
1. 安装 Node.js（v16 或更高版本）。
2. 运行 \`npm install\` 安装依赖项。
3. 运行 \`npm start\` 在端口 3000 上启动服务器。

## 端点
- **POST /query**: 根据集团代码和显示命令查询数据（例如，\`{"input": "showcolor HBFX+2020"}\`）。
- **GET /search**: 搜索经济研究网站（例如，\`?query=economic&limit=10&offset=0\`）。
- **POST /plotting/***: 生成图表（折线图、条形图、饼图、柱状图）。

## 注意事项
- 图表生成使用 Chart.js 进行服务器端渲染。
- 数据源为模拟数据，以避免外部 API 依赖。
- 部分绘图端点尚未实现。
- 本地运行以避免 Cloudflare Workers 的 403 错误。

## 测试
使用 Postman 或 curl 测试端点：
- \`curl -X POST http://localhost:3000/query -H "Content-Type: application/json" -d '{"input": "showcolor HBFX+2020"}'\`
- \`curl http://localhost:3000/search?query=economic'\`
`);

module.exports = {
  projectDir,
  description: '初始 Node.js API，实现中国数据查询 OpenAPI 规范。'
};
