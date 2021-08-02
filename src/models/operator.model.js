const query = require('../db/db-connection');
const { multipleColumnSet } = require('../utils/common.utils');
const Role = require('../utils/userRoles.utils');
class OperatorModel {
    userTableName = 'tb_user';
    approvalTableName = 'tb_biz_user';
    find = async (params = {}) => {
        let sql = `SELECT * FROM ${this.approvalTableName}`;

        if (!Object.keys(params).length) {
            return await query(sql);
        }

        const { columnSet, values } = multipleColumnSet(params)
        sql += ` WHERE ${columnSet}`;

        return await query(sql, [...values]);
    }

    approve = async (arrBid) => {
        const cond = [2,3]//arrBid.map(id=>id).join()

        const sql = `UPDATE ${this.approvalTableName} SET
            status = 'ast002'
        WHERE bid in (?)`;

        const result = await query(sql, [cond.join()]);
        console.log(result);

        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }


    findOne = async (params) => {
        const { columnSet, values } = multipleColumnSet(params)

        const sql = `SELECT * FROM ${this.userTableName}
        WHERE ${columnSet}`;

        const result = await query(sql, [...values]);

        // return back the first row (user)
        return result[0];
    }

    create = async ({ email,first_name, last_name, job, phone,company_name,  password, subdomain }) => {
        const sql = `INSERT INTO ${this.approvalTableName}
        (email, first_nm, last_nm, job, phone, company_nm, password, subdomain,reg_dt) VALUES (?,?,?,?,?,?,?,?,now())`;

        const result = await query(sql, [email,first_name, last_name, job, phone,company_name,  password, subdomain]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }

    update = async (params, id) => {
        const { columnSet, values } = multipleColumnSet(params)

        const sql = `UPDATE user SET ${columnSet} WHERE id = ?`;

        const result = await query(sql, [...values, id]);

        return result;
    }

    delete = async (id) => {
        const sql = `DELETE FROM ${this.tableName}
        WHERE id = ?`;
        const result = await query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new OperatorModel;
