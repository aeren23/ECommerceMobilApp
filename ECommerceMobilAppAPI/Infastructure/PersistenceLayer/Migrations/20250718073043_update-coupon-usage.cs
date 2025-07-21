using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersistenceLayer.Migrations
{
    /// <inheritdoc />
    public partial class updatecouponusage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OrderId",
                table: "CouponUsages",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "QuantityUsed",
                table: "CouponUsages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_CouponUsages_OrderId",
                table: "CouponUsages",
                column: "OrderId");

            migrationBuilder.AddForeignKey(
                name: "FK_CouponUsages_Orders_OrderId",
                table: "CouponUsages",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CouponUsages_Orders_OrderId",
                table: "CouponUsages");

            migrationBuilder.DropIndex(
                name: "IX_CouponUsages_OrderId",
                table: "CouponUsages");

            migrationBuilder.DropColumn(
                name: "OrderId",
                table: "CouponUsages");

            migrationBuilder.DropColumn(
                name: "QuantityUsed",
                table: "CouponUsages");
        }
    }
}
