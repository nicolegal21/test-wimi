import Database from 'better-sqlite3';

// Previous getMembers()

// export async function getMembers(project_id: number) {
//     const db = new Database('../projects.db');
//     const statement = db.prepare(`
//         SELECT u.id, CONCAT(u.first_name, ' ',u.last_name) AS name
//         FROM projects_members pm
//         JOIN users u on u.id = pm.user_id 
//         WHERE pm.project_id = ?;
//     `).bind(project_id);
//     const result = statement.all();
//     db.close();
//     return result;
// }

export async function getMembers(project_id: number): Promise<Array<User>> {
    const db = new Database('../projects.db');
    const statement = db.prepare<Array<never>, {id: number, name: string, group_name: string}>(`
        WITH RECURSIVE groups_recursive AS (
            -- get groups linked to project
            SELECT g.id, g.name, g.parent_id
            FROM projects_members pm
            JOIN groups g ON pm.group_id = g.id
            WHERE pm.project_id = ${project_id}
            UNION ALL
            -- get children recursively
            SELECT g.id, g.name, g.parent_id
            FROM groups g
            JOIN groups_recursive gh ON g.parent_id = gh.id
        ),
        project_users AS (
            -- get users linked to project without groups
            SELECT u.id, u.first_name, u.last_name, NULL AS group_name
            FROM projects_members pm
            JOIN users u ON pm.user_id = u.id
            WHERE pm.project_id = ${project_id}
            UNION
            -- get user linked to project through groups
            SELECT u.id, u.first_name, u.last_name, gh.name AS group_name
            FROM groups_members gm
            JOIN users u ON gm.user_id = u.id
            JOIN groups_recursive gh ON gm.group_id = gh.id
        )
        SELECT 
            pu.id,
            CONCAT(pu.first_name, ' ', pu.last_name) AS name,
            pu.group_name
        FROM project_users pu
        ORDER BY pu.id, pu.group_name;
    `);
    const result = statement.all();
    const userGroupsMap: Record<number, User> = {};
    result.forEach(user => {
        // if the user is not yet in the array, we add it with an empty groups array
        if (!userGroupsMap[user.id]) {
            userGroupsMap[user.id] = {
                id: user.id,
                name: user.name,
                groups: []
            };
        }
        // if the user has a group, we add it to its groups array
        if (user.group_name) {
            userGroupsMap[user.id].groups.push(user.group_name);
        }
    });
    db.close();
    return Object.values(userGroupsMap);
}

export async function addMembers(project_id: number, user_ids: Array<number>): Promise<Array<User> | undefined> {
    const db = new Database('../projects.db');
    try {
        const insert = db.prepare(`
            INSERT INTO projects_members(project_id, user_id, created_at) VALUES (@project_id, @user_id, DATETIME('now'));
        `);
    
        const insertMany = db.transaction((user_ids: Array<number>) => {
            for (const user_id of user_ids) {
                insert.run({
                    project_id: project_id,
                    user_id: user_id
                });
            }
        });
    
        insertMany(user_ids);

        const statement = db.prepare<Array<never>, User>(`
            SELECT u.id, CONCAT(u.first_name, ' ',u.last_name) AS name
            FROM projects_members pm
            JOIN users u ON u.id = pm.user_id 
            WHERE pm.project_id = ${project_id} AND pm.user_id IN (${user_ids.join(',')});
        `);
        const result = statement.all();
        db.close();
        return result;
    } catch (err) {
        if (!db.inTransaction) {
            throw err; // transaction was forcefully rolled back
        }
    }
    db.close();
}

export async function deleteMember(project_id: number, user_id: number): Promise<void | undefined> {
    const db = new Database('../projects.db');
    db.prepare('DELETE FROM projects_members WHERE project_id = ? AND user_id = ?').run(project_id, user_id);
    db.close();
}

