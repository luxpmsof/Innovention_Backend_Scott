const query = require('../db/db-connection');
const { multipleColumnSet } = require('../utils/common.utils');
const Role = require('../utils/userRoles.utils');
class ItemModel {
    itemTableName = 'tb_item';
    itemGroupTableName = 'tb_item_group';
    findItem = async (params = {}) => {

        let sql = `select * from ${this.itemTableName}`;

        if (!Object.keys(params).length) {
            return await query(sql);
        }

        const { columnSet, values } = multipleColumnSet(params)
        sql += ` WHERE bid = ${params.bid}`;
        if(params.gid)
            sql += ` and gid = ${params.gid} `;
        if(params.item_nm)
            sql += ` and item_nm like '%${params.item_nm}%'`
        if(params.item_cd)
            sql += ` and item_cd like '%${params.item_cd}%'`

        sql += ' order by item_cd'
        console.log(sql);
        return await query(sql, [...values]);
    }
    findItemGroup = async (params = {}) => {
        let sql = `SELECT * 
                    ,(select cmm_txt from tb_common where cmm_cd = unit_cd) as unit
                    ,(select cmm_txt from tb_common where cmm_cd = currency_cd) as currency
                    ,FORMAT(unit_cost , 0) as unit_cost
                   FROM ${this.itemGroupTableName}`;



        sql += ` WHERE bid = ? `;

        console.log(sql);
        return await query(sql, [params.bid]);
    }


    createItemGroup = async (description='',unit_cd,currency_cd,item_group_cd,item_group_nm,unit_adjust,unit_cost=0,bid ) => {

        const sql = `INSERT INTO ${this.itemGroupTableName}
        (description,unit_cd,currency_cd,item_group_cd,item_group_nm,unit_adjust,unit_cost,bid) VALUES (?,?,?,?,?,?,?,?)`;
        console.log(sql,bid);
        const result = await query(sql, [description,unit_cd,currency_cd,item_group_cd,item_group_nm,unit_adjust,unit_cost,bid]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }

    createItem = async (gid,description='',unit_cd,currency_cd,item_cd,item_nm,unit_adjust,unit_cost=0,size='',color='',material='',weight='',bid ) => {
        description = description;
        color = color;
        material = material;
        weight = weight;
        size = size;
        unit_cost = unit_cost;
        try {
            const sql = `INSERT INTO ${this.itemTableName}
        (gid,description,unit_cd,currency_cd,item_cd,item_nm,unit_adjust,unit_cost,color,weight,material,size,bid) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;

            const result = await query(sql, [gid, description, unit_cd, currency_cd, item_cd, item_nm, unit_adjust, unit_cost, color, weight, material, size,bid]);
            const affectedRows = result ? result.affectedRows : 0;
            return affectedRows;
        }catch(e) {
            console.log(e.message);
            return -1;
        }

    }

    findBalance = async (params = {}) => {

        let sql = `select i.*
     ,(select cmm_txt from tb_common where cmm_cd = i.unit_cd) as unit
     ,(select cmm_txt from tb_common where cmm_cd = i.currency_cd) as currency
     ,FORMAT(i.unit_cost , 0) as unit_cost ,ig.item_group_cd from tb_item_group  ig, tb_item i `;

        if (!Object.keys(params).length) {
            return await query(sql);
        }
        const values = [];
       // const { columnSet, values } = multipleColumnSet(params)
        sql += ` where i.gid = ig.gid
                   and i.bid = ig.bid
                   and ig.bid = ?
               `;
        console.log(params);
        values.push(params.bid);

        if(params.item_group_cd) {
            sql += ` and ig.item_group_cd like ?`
            values.push(`%${params.item_group_cd}%`);
        }

        if(params.item_nm) {
            sql += ` and i.item_nm like ?`
            values.push(`%${params.item_nm}%`);
        }
        if(params.item_cd){
            sql += ` and i.item_cd like ?`
            values.push(`%${params.item_cd}%`);
        }


        sql +=  ` order by i.gid,item_cd`;
        console.log(sql);
        return await query(sql, values);
    }


    plus = async (params) => {
        const { columnSet, values } = multipleColumnSet(params)

        const sql = `UPDATE tb_item SET balance =  balance + ? WHERE iid = ?`;

        const result = await query(sql, [params.adjust,params.iid]);

        return result;
    }

    minus = async (params, id) => {
        const { columnSet, values } = multipleColumnSet(params)

        const sql = `UPDATE tb_item SET balance = balance - ? WHERE iid = ?`;

        const result = await query(sql, [params.adjust,params.iid]);

        return result;
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

module.exports = new ItemModel;
