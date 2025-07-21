﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersistenceLayer.Migrations
{
    /// <inheritdoc />
    public partial class update_cartItemprice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "CartItems",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Price",
                table: "CartItems");
        }
    }
}
