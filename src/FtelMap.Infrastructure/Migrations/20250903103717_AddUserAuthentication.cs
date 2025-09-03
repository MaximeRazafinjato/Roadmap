using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FtelMap.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAuthentication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LastLoginAt",
                table: "Users",
                newName: "RefreshTokenExpiryTime");

            migrationBuilder.AddColumn<string>(
                name: "RefreshToken",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Users",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RefreshToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "RefreshTokenExpiryTime",
                table: "Users",
                newName: "LastLoginAt");
        }
    }
}
