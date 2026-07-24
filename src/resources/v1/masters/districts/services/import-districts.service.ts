class importDistrictsService {
  public async execute(): Promise<any> {
    return {
      result: {
        code: 200,
        message: "Import districts is not implemented yet.",
        data: [],
      },
      DbTransactions: [],
    };
  }
}

export default new importDistrictsService();
