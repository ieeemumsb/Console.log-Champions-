import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new department
export const createDepartment = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    managerId: v.optional(v.id("users")),
    budgetLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if department code already exists
    const existingDept = await ctx.db
      .query("departments")
      .withIndex("byCode", (q) => q.eq("code", args.code))
      .first();

    if (existingDept) {
      throw new Error(`Department with code "${args.code}" already exists`);
    }

    const departmentId = await ctx.db.insert("departments", {
      name: args.name,
      code: args.code.toUpperCase(),
      description: args.description,
      managerId: args.managerId,
      budgetLimit: args.budgetLimit,
      isActive: true,
    });

    return departmentId;
  },
});

// Get all departments
export const getAllDepartments = query({
  args: {},
  handler: async (ctx) => {
    const departments = await ctx.db
      .query("departments")
      .order("desc")
      .collect();

    // Get manager details for each department
    const departmentsWithManagers = await Promise.all(
      departments.map(async (dept) => {
        let manager = null;
        if (dept.managerId) {
          manager = await ctx.db.get(dept.managerId);
        }
        return {
          ...dept,
          manager: manager ? { name: manager.name, email: manager.emailAddress } : null,
        };
      })
    );

    return departmentsWithManagers;
  },
});

// Get active departments only
export const getActiveDepartments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc", "name")
      .collect();
  },
});

// Get department by ID
export const getDepartmentById = query({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    const department = await ctx.db.get(args.departmentId);
    if (!department) {
      throw new Error("Department not found");
    }

    let manager = null;
    if (department.managerId) {
      manager = await ctx.db.get(department.managerId);
    }

    return {
      ...department,
      manager: manager ? { name: manager.name, email: manager.emailAddress } : null,
    };
  },
});

// Get department by code
export const getDepartmentByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("departments")
      .withIndex("byCode", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
  },
});

// Update department
export const updateDepartment = mutation({
  args: {
    departmentId: v.id("departments"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    managerId: v.optional(v.id("users")),
    budgetLimit: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { departmentId, ...updates } = args;
    
    const department = await ctx.db.get(departmentId);
    if (!department) {
      throw new Error("Department not found");
    }

    await ctx.db.patch(departmentId, updates);
    return departmentId;
  },
});

// Delete department (soft delete - set inactive)
export const deleteDepartment = mutation({
  args: { departmentId: v.id("departments") },
  handler: async (ctx, args) => {
    const department = await ctx.db.get(args.departmentId);
    if (!department) {
      throw new Error("Department not found");
    }

    await ctx.db.patch(args.departmentId, { isActive: false });
    return args.departmentId;
  },
});

// Get departments managed by a user
export const getDepartmentsByManager = query({
  args: { managerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("departments")
      .withIndex("byManager", (q) => q.eq("managerId", args.managerId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});