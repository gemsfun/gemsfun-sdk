/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/pump.json`.
 */
export type Pump = {
  "address": "BbB1tcCWeuXTMdqfMs93qjUEGhmax3WvWxLyEPYwAAZP",
  "metadata": {
    "name": "pump",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addMarketCap",
      "discriminator": [
        50,
        12,
        102,
        227,
        221,
        213,
        84,
        3
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "marketCap",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  99,
                  97,
                  112
                ]
              },
              {
                "kind": "arg",
                "path": "index"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "totalSupply",
          "type": "u64"
        },
        {
          "name": "solReserves",
          "type": "u64"
        },
        {
          "name": "tokenReserves",
          "type": "u64"
        },
        {
          "name": "tokenLiquidity",
          "type": "u64"
        }
      ]
    },
    {
      "name": "buy",
      "discriminator": [
        102,
        6,
        61,
        18,
        1,
        218,
        235,
        234
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator"
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "marketCap",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  99,
                  97,
                  112
                ]
              },
              {
                "kind": "arg",
                "path": "marketCapIndex"
              }
            ]
          },
          "relations": [
            "bondingCurve"
          ]
        },
        {
          "name": "feeRecipient",
          "writable": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associatedBondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurve"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedUser",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "creatorRevenuePool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  114,
                  101,
                  118,
                  101,
                  110,
                  117,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "referral",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "marketCapIndex",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "maxSolCost",
          "type": "u64"
        },
        {
          "name": "referralFee",
          "type": "f64"
        }
      ]
    },
    {
      "name": "buyLottery",
      "discriminator": [
        160,
        226,
        177,
        255,
        84,
        50,
        57,
        223
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator"
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "marketCap",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  99,
                  97,
                  112
                ]
              },
              {
                "kind": "arg",
                "path": "marketCapIndex"
              }
            ]
          },
          "relations": [
            "bondingCurveLottery"
          ]
        },
        {
          "name": "feeRecipient",
          "writable": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "bondingCurveLottery",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  108,
                  111,
                  116,
                  116,
                  101,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associatedBondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurveLottery"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedUser",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "creatorRevenuePool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  114,
                  101,
                  118,
                  101,
                  110,
                  117,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "referral",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "participant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  105,
                  99,
                  105,
                  112,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "marketCapIndex",
          "type": "u8"
        },
        {
          "name": "amountSolBuy",
          "type": "u64"
        },
        {
          "name": "amountTokenBuy",
          "type": "u64"
        },
        {
          "name": "maxSolCost",
          "type": "u64"
        },
        {
          "name": "referralFee",
          "type": "f64"
        },
        {
          "name": "isOwnerBuyAfterCreate",
          "type": "bool"
        }
      ]
    },
    {
      "name": "claimCreatorRevenue",
      "discriminator": [
        54,
        121,
        197,
        151,
        27,
        190,
        78,
        74
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "creatorRevenuePool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  114,
                  101,
                  118,
                  101,
                  110,
                  117,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "creatorTokenAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": []
    },
    {
      "name": "create",
      "discriminator": [
        24,
        30,
        200,
        40,
        5,
        28,
        7,
        119
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "marketCap",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  99,
                  97,
                  112
                ]
              },
              {
                "kind": "arg",
                "path": "marketCapIndex"
              }
            ]
          }
        },
        {
          "name": "mint",
          "writable": true,
          "signer": true
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associatedBondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurve"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "metadata",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenMetadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "marketCapIndex",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "aiGenerated",
          "type": "bool"
        }
      ]
    },
    {
      "name": "createCreatorRevenuePool",
      "discriminator": [
        85,
        75,
        199,
        97,
        201,
        114,
        78,
        69
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint"
        },
        {
          "name": "creatorRevenuePool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  114,
                  101,
                  118,
                  101,
                  110,
                  117,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createLottery",
      "discriminator": [
        242,
        165,
        247,
        119,
        17,
        203,
        21,
        42
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "marketCap",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  99,
                  97,
                  112
                ]
              },
              {
                "kind": "arg",
                "path": "marketCapIndex"
              }
            ]
          }
        },
        {
          "name": "mint",
          "writable": true,
          "signer": true
        },
        {
          "name": "bondingCurveLottery",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  108,
                  111,
                  116,
                  116,
                  101,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associatedBondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurveLottery"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "metadata",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenMetadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "marketCapIndex",
          "type": "u8"
        },
        {
          "name": "createLottery",
          "type": {
            "defined": {
              "name": "createLotteryConfig"
            }
          }
        }
      ]
    },
    {
      "name": "depositForLottery",
      "discriminator": [
        168,
        220,
        237,
        103,
        167,
        165,
        154,
        120
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "bondingCurveLottery",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  108,
                  111,
                  116,
                  116,
                  101,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "participant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  105,
                  99,
                  105,
                  112,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "solAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "executeLotteryDraw",
      "discriminator": [
        211,
        129,
        202,
        159,
        208,
        33,
        231,
        155
      ],
      "accounts": [
        {
          "name": "crankOperator",
          "writable": true,
          "signer": true
        },
        {
          "name": "bondingCurveLottery",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  108,
                  111,
                  116,
                  116,
                  101,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "marketCap",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  99,
                  97,
                  112
                ]
              },
              {
                "kind": "arg",
                "path": "marketCapIndex"
              }
            ]
          },
          "relations": [
            "bondingCurveLottery"
          ]
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "associatedBondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurveLottery"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "marketCapIndex",
          "type": "u8"
        },
        {
          "name": "referralFee",
          "type": "f64"
        },
        {
          "name": "batchIndex",
          "type": {
            "option": "u8"
          }
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "fee",
          "type": "f64"
        },
        {
          "name": "referralFee",
          "type": "f64"
        },
        {
          "name": "feeRecipient",
          "type": "pubkey"
        },
        {
          "name": "raydiumMigrator",
          "type": "pubkey"
        },
        {
          "name": "presetHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "sell",
      "discriminator": [
        51,
        230,
        133,
        164,
        1,
        127,
        131,
        173
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator"
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "marketCap",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  99,
                  97,
                  112
                ]
              },
              {
                "kind": "arg",
                "path": "marketCapIndex"
              }
            ]
          },
          "relations": [
            "bondingCurve"
          ]
        },
        {
          "name": "feeRecipient",
          "writable": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associatedBondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurve"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedUser",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "creatorRevenuePool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  114,
                  101,
                  118,
                  101,
                  110,
                  117,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "referral",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "marketCapIndex",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "minSolOutput",
          "type": "u64"
        },
        {
          "name": "referralFee",
          "type": "f64"
        }
      ]
    },
    {
      "name": "sellLottery",
      "discriminator": [
        150,
        115,
        212,
        181,
        72,
        31,
        44,
        99
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "creator"
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "marketCap",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  99,
                  97,
                  112
                ]
              },
              {
                "kind": "arg",
                "path": "marketCapIndex"
              }
            ]
          },
          "relations": [
            "bondingCurveLottery"
          ]
        },
        {
          "name": "feeRecipient",
          "writable": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "bondingCurveLottery",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  108,
                  111,
                  116,
                  116,
                  101,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associatedBondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurveLottery"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedUser",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "creatorRevenuePool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  114,
                  101,
                  118,
                  101,
                  110,
                  117,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "referral",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "marketCapIndex",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "minSolOutput",
          "type": "u64"
        },
        {
          "name": "referralFee",
          "type": "f64"
        }
      ]
    },
    {
      "name": "updateConfig",
      "discriminator": [
        29,
        158,
        252,
        191,
        10,
        83,
        219,
        99
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "newAdmin",
          "type": "pubkey"
        },
        {
          "name": "fee",
          "type": "f64"
        },
        {
          "name": "referralFee",
          "type": "f64"
        },
        {
          "name": "feeRecipient",
          "type": "pubkey"
        },
        {
          "name": "raydiumMigrator",
          "type": "pubkey"
        },
        {
          "name": "tokenDecimals",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateMarketCap",
      "discriminator": [
        156,
        26,
        59,
        174,
        248,
        194,
        240,
        85
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "marketCap",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  99,
                  97,
                  112
                ]
              },
              {
                "kind": "arg",
                "path": "index"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u8"
        },
        {
          "name": "totalSupply",
          "type": "u64"
        },
        {
          "name": "solReserves",
          "type": "u64"
        },
        {
          "name": "tokenReserves",
          "type": "u64"
        },
        {
          "name": "tokenLiquidity",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "raydiumMigrator",
          "writable": true,
          "signer": true,
          "relations": [
            "global"
          ]
        },
        {
          "name": "global",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "marketCap",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116,
                  95,
                  99,
                  97,
                  112
                ]
              },
              {
                "kind": "arg",
                "path": "marketCapIndex"
              }
            ]
          },
          "relations": [
            "bondingCurve"
          ]
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "bondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associatedBondingCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurve"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "associatedMigrator",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "raydiumMigrator"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "marketCapIndex",
          "type": "u8"
        }
      ]
    },
    {
      "name": "withdrawSolLottery",
      "discriminator": [
        46,
        104,
        211,
        6,
        206,
        16,
        163,
        84
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "bondingCurveLottery",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  108,
                  111,
                  116,
                  116,
                  101,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "participant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  105,
                  99,
                  105,
                  112,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "eventAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  95,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "program"
        }
      ],
      "args": [
        {
          "name": "solAmount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bondingCurve",
      "discriminator": [
        23,
        183,
        248,
        55,
        96,
        216,
        172,
        96
      ]
    },
    {
      "name": "bondingCurveLottery",
      "discriminator": [
        158,
        59,
        68,
        118,
        214,
        15,
        41,
        165
      ]
    },
    {
      "name": "creatorRevenuePool",
      "discriminator": [
        91,
        123,
        114,
        154,
        235,
        100,
        51,
        227
      ]
    },
    {
      "name": "global",
      "discriminator": [
        167,
        232,
        232,
        177,
        200,
        108,
        114,
        127
      ]
    },
    {
      "name": "marketCap",
      "discriminator": [
        182,
        231,
        202,
        165,
        75,
        159,
        248,
        8
      ]
    },
    {
      "name": "participant",
      "discriminator": [
        32,
        142,
        108,
        79,
        247,
        179,
        54,
        6
      ]
    }
  ],
  "events": [
    {
      "name": "claimCreatorRevenueEvent",
      "discriminator": [
        235,
        87,
        240,
        25,
        60,
        35,
        192,
        81
      ]
    },
    {
      "name": "createEvent",
      "discriminator": [
        27,
        114,
        169,
        77,
        222,
        235,
        99,
        118
      ]
    },
    {
      "name": "createLotteryEvent",
      "discriminator": [
        253,
        182,
        17,
        132,
        86,
        38,
        93,
        0
      ]
    },
    {
      "name": "lotterySpinEvent",
      "discriminator": [
        224,
        225,
        226,
        97,
        47,
        226,
        67,
        173
      ]
    },
    {
      "name": "lotteryWinEvent",
      "discriminator": [
        195,
        12,
        53,
        238,
        147,
        237,
        214,
        61
      ]
    },
    {
      "name": "swapEvent",
      "discriminator": [
        64,
        198,
        205,
        232,
        38,
        8,
        113,
        226
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidMintAuthority",
      "msg": "Invalid mint authority"
    },
    {
      "code": 6001,
      "name": "invalidAmount",
      "msg": "Invalid amount"
    },
    {
      "code": 6002,
      "name": "noTokensAvailable",
      "msg": "No tokens available. User has to wait for the next distribution or deposits sol to the lottery pool."
    },
    {
      "code": 6003,
      "name": "tooMuchSolRequired",
      "msg": "slippage: Too much SOL required to buy the given amount of tokens.."
    },
    {
      "code": 6004,
      "name": "solReturnedNotEnough",
      "msg": "slippage: Not enough SOL returned to sell the given amount of tokens.."
    },
    {
      "code": 6005,
      "name": "bondingCurveComplete",
      "msg": "The bonding curve has completed and liquidity migrated to raydium.."
    },
    {
      "code": 6006,
      "name": "bondingCurveNotComplete",
      "msg": "The bonding curve has not completed yet"
    },
    {
      "code": 6007,
      "name": "invalidMarketCapIndex",
      "msg": "Invalid market cap index"
    },
    {
      "code": 6008,
      "name": "invalidReferralFee",
      "msg": "Invalid referral fee"
    },
    {
      "code": 6009,
      "name": "lotteryInactive",
      "msg": "Lottery pool is not activated"
    },
    {
      "code": 6010,
      "name": "noParticipationFound",
      "msg": "No participation found for this user"
    },
    {
      "code": 6011,
      "name": "participantWithdrawn",
      "msg": "Participant has already withdrawn"
    },
    {
      "code": 6012,
      "name": "invalidRewardMint",
      "msg": "Invalid reward token mint specified for the lottery pool."
    },
    {
      "code": 6013,
      "name": "lotteryNotYetEnded",
      "msg": "Lottery round has not yet ended."
    },
    {
      "code": 6014,
      "name": "winnerAlreadySet",
      "msg": "Winner for the current lottery round has already been set."
    },
    {
      "code": 6015,
      "name": "winnerNotSet",
      "msg": "Winner has not been set yet"
    },
    {
      "code": 6016,
      "name": "winnerAddressMismatch",
      "msg": "Winner address mismatch"
    },
    {
      "code": 6017,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic operation resulted in an overflow or underflow."
    },
    {
      "code": 6018,
      "name": "divisionByZero",
      "msg": "Divisor amount out is 0"
    },
    {
      "code": 6019,
      "name": "noSolInLottery",
      "msg": "There is no SOL currently staked in the lottery pool for a draw."
    },
    {
      "code": 6020,
      "name": "noSolToWithdraw",
      "msg": "All SOL deposited by the participant has already been withdrawn."
    },
    {
      "code": 6021,
      "name": "insufficientSolToWithdraw",
      "msg": "Insufficient SOL available to withdraw for the participant."
    },
    {
      "code": 6022,
      "name": "noParticipants",
      "msg": "No active participants found for the lottery draw."
    },
    {
      "code": 6023,
      "name": "randomnessGenerationFailed",
      "msg": "Failed to generate randomness for winner selection."
    },
    {
      "code": 6024,
      "name": "winnerSelectionFailed",
      "msg": "Failed to select a winner from the participants."
    },
    {
      "code": 6025,
      "name": "invalidAccountAddress",
      "msg": "Invalid account address"
    },
    {
      "code": 6026,
      "name": "winnerHasNoSol",
      "msg": "Winner has no SOL"
    },
    {
      "code": 6027,
      "name": "insufficientFundsForTransaction",
      "msg": "Insufficient funds for transaction"
    },
    {
      "code": 6028,
      "name": "insufficientFundsForLotteryTurn",
      "msg": "Insufficient funds for the current lottery turn based on initial contribution."
    },
    {
      "code": 6029,
      "name": "alreadyWithdrawn",
      "msg": "Participant has already withdrawn their funds."
    },
    {
      "code": 6030,
      "name": "lotteryNotStarted",
      "msg": "Lottery has not started yet."
    },
    {
      "code": 6031,
      "name": "lotteryEnded",
      "msg": "Lottery has already ended."
    },
    {
      "code": 6032,
      "name": "distributionNotDue",
      "msg": "Distribution is not yet due."
    },
    {
      "code": 6033,
      "name": "marketCapNotInitialized",
      "msg": "Market cap not initialized."
    },
    {
      "code": 6034,
      "name": "invalidCaller",
      "msg": "Invalid caller for this function."
    },
    {
      "code": 6035,
      "name": "invalidConfig",
      "msg": "Invalid configuration parameters."
    },
    {
      "code": 6036,
      "name": "invalidMint",
      "msg": "Invalid mint for the operation."
    },
    {
      "code": 6037,
      "name": "tokenTransferFailed",
      "msg": "Token transfer failed."
    },
    {
      "code": 6038,
      "name": "associatedTokenAccountCreationFailed",
      "msg": "Failed to create associated token account."
    },
    {
      "code": 6039,
      "name": "operationFailed",
      "msg": "Generic error for failed operations."
    },
    {
      "code": 6040,
      "name": "invalidLotteryDuration",
      "msg": "Lottery duration must be a positive value."
    },
    {
      "code": 6041,
      "name": "invalidDistributionInterval",
      "msg": "Lottery distribution interval must be a positive value."
    },
    {
      "code": 6042,
      "name": "nameTooLong",
      "msg": "Name too long."
    },
    {
      "code": 6043,
      "name": "symbolTooLong",
      "msg": "Symbol too long."
    },
    {
      "code": 6044,
      "name": "uriTooLong",
      "msg": "URI too long."
    },
    {
      "code": 6045,
      "name": "slippageExceeded",
      "msg": "Slippage tolerance exceeded."
    },
    {
      "code": 6046,
      "name": "maxMarketCapLevelsReached",
      "msg": "The number of market cap levels has reached its limit."
    },
    {
      "code": 6047,
      "name": "invalidBump",
      "msg": "Invalid bump seed for PDA."
    },
    {
      "code": 6048,
      "name": "clockSysvarError",
      "msg": "Failed to get clock sysvar."
    },
    {
      "code": 6049,
      "name": "dataTypeMismatch",
      "msg": "Data type mismatch."
    },
    {
      "code": 6050,
      "name": "deserializationError",
      "msg": "Failed to deserialize account data."
    },
    {
      "code": 6051,
      "name": "serializationError",
      "msg": "Failed to serialize account data."
    },
    {
      "code": 6052,
      "name": "invalidProgramId",
      "msg": "Invalid program ID."
    },
    {
      "code": 6053,
      "name": "accountOwnerMismatch",
      "msg": "Account owner mismatch."
    },
    {
      "code": 6054,
      "name": "numericConversionFailed",
      "msg": "Numeric conversion failed."
    },
    {
      "code": 6055,
      "name": "unexpectedError",
      "msg": "An unexpected error occurred."
    },
    {
      "code": 6056,
      "name": "invalidPresetHash",
      "msg": "Provided preset hash does not match the expected value."
    },
    {
      "code": 6057,
      "name": "invalidTokenDecimals",
      "msg": "Invalid token decimals."
    },
    {
      "code": 6058,
      "name": "invalidTokenSupply",
      "msg": "Invalid token supply."
    },
    {
      "code": 6059,
      "name": "invalidLiquidity",
      "msg": "Invalid liquidity amount."
    },
    {
      "code": 6060,
      "name": "invalidPdaStructure",
      "msg": "Invalid PDA structure or data."
    },
    {
      "code": 6061,
      "name": "zeroLengthParticipantData",
      "msg": "Participant data has zero length which is invalid."
    },
    {
      "code": 6062,
      "name": "unauthorized",
      "msg": "User is not authorized to perform this action."
    },
    {
      "code": 6063,
      "name": "tokenReservesMismatch",
      "msg": "Token reserves mismatch after calculation."
    },
    {
      "code": 6064,
      "name": "solReservesMismatch",
      "msg": "SOL reserves mismatch after calculation."
    },
    {
      "code": 6065,
      "name": "invalidAmountOut",
      "msg": "Invalid calculation for token amount out."
    },
    {
      "code": 6066,
      "name": "invalidAmountIn",
      "msg": "Invalid calculation for SOL amount in."
    },
    {
      "code": 6067,
      "name": "referralSameAsFeeRecipient",
      "msg": "Referral account is the same as fee recipient."
    },
    {
      "code": 6068,
      "name": "maxSupplyReached",
      "msg": "Maximum token supply reached."
    },
    {
      "code": 6069,
      "name": "insufficientRevenue",
      "msg": "Insufficient Revenue to claim"
    },
    {
      "code": 6070,
      "name": "invalidCreatorRevenuePoolPda",
      "msg": "Invalid Creator Revenue Pool PDA"
    },
    {
      "code": 6071,
      "name": "insufficientSolForTransaction",
      "msg": "Insufficient SOL provided for transaction. Amount provided must cover both token cost and lottery deposit."
    }
  ],
  "types": [
    {
      "name": "bondingCurve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "marketCap",
            "type": "pubkey"
          },
          {
            "name": "reserveSol",
            "type": "u64"
          },
          {
            "name": "reserveToken",
            "type": "u64"
          },
          {
            "name": "completed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "bondingCurveLottery",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "marketCap",
            "type": "pubkey"
          },
          {
            "name": "reserveSol",
            "type": "u64"
          },
          {
            "name": "reserveToken",
            "type": "u64"
          },
          {
            "name": "completed",
            "type": "bool"
          },
          {
            "name": "totalSolDeposited",
            "type": "u64"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "tokensOwnerBuyAfterCreate",
            "type": "u64"
          },
          {
            "name": "lastDistribution",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "owner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "claimCreatorRevenueEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "createEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bondingCurve",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "marketCap",
            "type": "pubkey"
          },
          {
            "name": "aiGenerated",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "createLotteryConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "lotteryDuration",
            "type": "u32"
          },
          {
            "name": "aiGenerated",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "createLotteryEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bondingCurveLottery",
            "type": "pubkey"
          },
          {
            "name": "marketCap",
            "type": "pubkey"
          },
          {
            "name": "aiGenerated",
            "type": "bool"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "lotteryDuration",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "creatorRevenuePool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "accumulatedSol",
            "type": "u64"
          },
          {
            "name": "totalClaimed",
            "type": "u64"
          },
          {
            "name": "lastClaimTime",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "global",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "fee",
            "type": "f64"
          },
          {
            "name": "referralFee",
            "type": "f64"
          },
          {
            "name": "feeRecipient",
            "type": "pubkey"
          },
          {
            "name": "raydiumMigrator",
            "type": "pubkey"
          },
          {
            "name": "defaultTokenDecimals",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "lotterySpinEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lotteryPool",
            "type": "pubkey"
          },
          {
            "name": "spinner",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "lotteryWinEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lotteryPool",
            "type": "pubkey"
          },
          {
            "name": "winner",
            "type": "pubkey"
          },
          {
            "name": "solAmount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "marketCap",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "index",
            "type": "u8"
          },
          {
            "name": "defaultTotalSupply",
            "type": "u64"
          },
          {
            "name": "defaultSolReserves",
            "type": "u64"
          },
          {
            "name": "defaultTokenReserves",
            "type": "u64"
          },
          {
            "name": "defaultTokenLiquidity",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "participant",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "solDeposited",
            "type": "u64"
          },
          {
            "name": "withdrawn",
            "type": "bool"
          },
          {
            "name": "initialized",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "swapEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "solAmount",
            "type": "u64"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          },
          {
            "name": "isBuy",
            "type": "bool"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "virtualSolReserves",
            "type": "u64"
          },
          {
            "name": "virtualTokenReserves",
            "type": "u64"
          },
          {
            "name": "referral",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
