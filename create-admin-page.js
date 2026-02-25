const fs = require('fs');

// Read the current partial file
let content = fs.readFileSync('src/app/(dashboard)/admin/page.tsx', 'utf8');

// Add the remaining parts
content += `            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <>
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || t("no_name")}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={\`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full \${user.role === "superadmin" ? "bg-red-100 text-red-800" : user.role === "admin" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}\`}>
                        {user.role || t("user_role")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 font-medium">{user.templatesCount}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 font-medium">{user.projectsCount}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.hasApiKey ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{t("active")}</span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{t("no_api_key")}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(user.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">{expandedUser === user.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</div>
                    </td>
                  </tr>
`;

fs.writeFileSync('src/app/(dashboard)/admin/page-part1.txt', content);
console.log('Created part 1');
