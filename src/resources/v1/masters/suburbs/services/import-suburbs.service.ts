class importSuburbsService {
  public async execute(): Promise<any> {
    return {
      result: {
        code: 200,
        message: "Import suburbs is not implemented yet.",
        data: [],
      },
      DbTransactions: [],
    };
  }
}

export default new importSuburbsService();
