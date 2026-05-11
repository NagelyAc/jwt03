import crypto from "crypto";

export default (sequelize, Sequelize) => {
  const RefreshToken = sequelize.define("refresh_tokens", {
    token: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    expiryDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  RefreshToken.createToken = async (user) => {
    const expiredAt = new Date();

    expiredAt.setSeconds(expiredAt.getSeconds() + Number(process.env.JWT_REFRESH_EXPIRATION || 86400));

    const refreshToken = await RefreshToken.create({
      token: crypto.randomUUID(),
      userId: user.id,
      expiryDate: expiredAt,
    });

    return refreshToken.token;
  };

  RefreshToken.verifyExpiration = (token) => {
    return token.expiryDate.getTime() < new Date().getTime();
  };

  return RefreshToken;
};
